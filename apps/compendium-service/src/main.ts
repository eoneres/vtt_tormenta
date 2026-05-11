import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { CompendiumModule } from './compendium.module';

const logger = new Logger('CompendiumService');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    CompendiumModule,
    new FastifyAdapter({ logger: false }),
  );

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  });

  // OpenAPI
  const config = new DocumentBuilder()
    .setTitle('VTT Compendium Service')
    .setDescription(
      'REST API for game content: races, classes, spells, monsters, items and homebrew',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Compendium', 'Compendium entries CRUD and search')
    .addTag('Health', 'Service health and readiness probes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env['COMPENDIUM_PORT'] ?? 3040;
  await app.listen(port, '0.0.0.0');
  logger.log(`Compendium Service running on port ${port}`);
  logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  logger.error('Failed to start Compendium Service', err);
  process.exit(1);
});
