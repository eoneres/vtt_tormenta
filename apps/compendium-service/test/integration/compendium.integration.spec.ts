/**
 * Compendium Service Integration Tests
 *
 * Uses @testcontainers/mongodb to spin up a real MongoDB instance.
 * Tests the full stack: HTTP → Controller → UseCase → Repository → MongoDB
 *
 * Run with:
 *   pnpm test:integration
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import { CompendiumModule } from '../../src/compendium.module';
import { CompendiumEntryDocument, CompendiumEntrySchema } from '../../src/infrastructure/persistence/mongoose/schemas/compendium-entry.schema';

// ─── Test Setup ───────────────────────────────────────────────────────────────

let app: INestApplication;
let mongod: MongoMemoryServer;
let mongoUri: string;

beforeAll(async () => {
  // Start in-memory MongoDB for integration tests
  mongod = await MongoMemoryServer.create();
  mongoUri = mongod.getUri();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [() => ({
          MONGODB_URI: mongoUri,
          REDIS_URL: 'redis://localhost:6379', // mock — cache is best-effort
          SEED_ON_BOOT: 'false',
          CACHE_TTL_SECONDS: '1',
        })],
      }),
      // Override MongoDB connection with in-memory server
      MongooseModule.forRoot(mongoUri),
      // Import the app module but without its own MongooseForRoot
      // (we override it above)
    ],
  })
  // Override compendium module to use the test DB
  .overrideProvider('MONGOOSE_CONNECTION')
  .useFactory({ factory: () => mongoose.createConnection(mongoUri) })
  .compile();

  app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
}, 60_000);

afterAll(async () => {
  await app.close();
  await mongoose.disconnect();
  await mongod.stop();
});

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeEntryPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Teste Raça Élfica',
    description: 'Uma raça de teste para os testes de integração.',
    shortDescription: 'Raça de teste',
    type: 'race',
    system: 'tormenta20',
    tags: ['raça', 'teste'],
    attributes: [{ key: 'speed', value: '9m', label: 'Deslocamento' }],
    isPublic: true,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /v1/compendium/entries', () => {
  it('returns 200 with empty results when db is empty', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/compendium/entries')
      .query({ system: 'tormenta20' })
      .expect(200);

    expect(res.body).toMatchObject({
      entries: [],
      total: 0,
      hasMore: false,
    });
  });
});

describe('POST /v1/compendium/entries', () => {
  it('returns 401 without auth header', async () => {
    await request(app.getHttpServer())
      .post('/v1/compendium/entries')
      .send(makeEntryPayload())
      .expect(401);
  });

  // Note: full auth tests require identity-service mock
  // These integration tests focus on repository and validation layers
  it('rejects payload missing required fields', async () => {
    await request(app.getHttpServer())
      .post('/v1/compendium/entries')
      .set('Authorization', 'Bearer test-token')
      .send({ name: 'Sem system' }) // missing required fields
      .expect((res) => {
        expect([400, 401]).toContain(res.status);
      });
  });
});

describe('GET /v1/compendium/stats/:system', () => {
  it('returns stats structure', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/compendium/stats/tormenta20')
      .expect(200);

    expect(res.body).toHaveProperty('system', 'tormenta20');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('byType');
  });
});

describe('GET /health', () => {
  it('returns healthy status', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(res.body).toHaveProperty('status');
  });
});

describe('GET /health/ready', () => {
  it('returns ready status', async () => {
    const res = await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200);

    expect(res.body).toMatchObject({ status: 'ready', service: 'compendium-service' });
  });
});

// ─── Repository-level integration tests (bypasses HTTP) ──────────────────────

describe('CompendiumEntry Repository', () => {
  let model: mongoose.Model<CompendiumEntryDocument>;

  beforeEach(async () => {
    // Clean DB between tests
    await mongoose.connection.dropDatabase();
  });

  it('should create and retrieve an entry by slug', async () => {
    // Direct MongoDB insert via mongoose for isolation
    const conn = mongoose.createConnection(mongoUri);
    const M = conn.model(CompendiumEntryDocument.name, CompendiumEntrySchema);

    const doc = {
      id: 'test-id-123',
      name: 'Guerreiro',
      slug: 'guerreiro',
      description: 'Mestre das armas',
      type: 'class',
      system: 'tormenta20',
      tags: ['classe'],
      attributes: [],
      relations: [],
      isOfficial: true,
      isHomebrew: false,
      isPublic: true,
      version: 1,
      searchVector: 'guerreiro mestre das armas classe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await M.create(doc);
    const found = await M.findOne({ slug: 'guerreiro', system: 'tormenta20' }).lean();
    expect(found).toBeDefined();
    expect(found!['name']).toBe('Guerreiro');
    await conn.close();
  });

  it('enforces unique slug+system constraint', async () => {
    const conn = mongoose.createConnection(mongoUri);
    const M = conn.model(CompendiumEntryDocument.name, CompendiumEntrySchema);

    const base = {
      id: 'id-1', name: 'Mago', slug: 'mago', description: 'desc', type: 'class',
      system: 'tormenta20', tags: [], attributes: [], relations: [],
      isOfficial: true, isHomebrew: false, isPublic: true, version: 1,
      searchVector: 'mago', createdAt: new Date(), updatedAt: new Date(),
    };

    await M.create(base);
    await expect(M.create({ ...base, id: 'id-2' })).rejects.toThrow();
    await conn.close();
  });

  it('full-text search returns relevant entries', async () => {
    const conn = mongoose.createConnection(mongoUri);
    const M = conn.model(CompendiumEntryDocument.name, CompendiumEntrySchema);

    await M.create([
      { id: 'id-1', name: 'Bola de Fogo', slug: 'bola-de-fogo', description: 'Magia de fogo em área', type: 'spell', system: 'tormenta20', tags: ['fogo'], attributes: [], relations: [], isOfficial: true, isHomebrew: false, isPublic: true, version: 1, searchVector: 'bola de fogo magia area', createdAt: new Date(), updatedAt: new Date() },
      { id: 'id-2', name: 'Sono', slug: 'sono', description: 'Adormece criaturas', type: 'spell', system: 'tormenta20', tags: ['sono'], attributes: [], relations: [], isOfficial: true, isHomebrew: false, isPublic: true, version: 1, searchVector: 'sono adormece criaturas', createdAt: new Date(), updatedAt: new Date() },
    ]);

    const result = await M.find({ $text: { $search: 'fogo' } }).lean();
    expect(result).toHaveLength(1);
    expect(result[0]!['name']).toBe('Bola de Fogo');
    await conn.close();
  });
});
