import { Campaign } from '../../src/domain/campaign/entities/campaign.entity';
import { CampaignStatus } from '@vtt/shared-types';

describe('Campaign entity', () => {
  it('creates with defaults', () => {
    const c = Campaign.create({ ownerId: 'u1', systemId: 'tormenta20', name: 'Minha Campanha' });
    expect(c.id).toBeDefined();
    expect(c.status).toBe(CampaignStatus.ACTIVE);
    expect(c.settings.maxPlayers).toBe(6);
    expect(c.settings.xpSystem).toBe('milestone');
  });

  it('trims name on create', () => {
    const c = Campaign.create({ ownerId: 'u1', systemId: 'tormenta20', name: '  Arton  ' });
    expect(c.name).toBe('Arton');
  });

  it('updates name and description', () => {
    const c = Campaign.create({ ownerId: 'u1', systemId: 'tormenta20', name: 'Old' });
    c.update({ name: 'New', description: 'desc' });
    expect(c.name).toBe('New');
    expect(c.description).toBe('desc');
  });

  it('archives campaign', () => {
    const c = Campaign.create({ ownerId: 'u1', systemId: 'tormenta20', name: 'C' });
    c.archive();
    expect(c.status).toBe(CampaignStatus.ARCHIVED);
  });

  it('archive is idempotent', () => {
    const c = Campaign.create({ ownerId: 'u1', systemId: 'tormenta20', name: 'C' });
    c.archive();
    const updatedAt = c.updatedAt;
    c.archive();
    expect(c.updatedAt).toEqual(updatedAt);
  });

  it('isOwnedBy returns correct result', () => {
    const c = Campaign.create({ ownerId: 'u1', systemId: 'tormenta20', name: 'C' });
    expect(c.isOwnedBy('u1')).toBe(true);
    expect(c.isOwnedBy('u2')).toBe(false);
  });

  it('reconstitutes from persistence', () => {
    const now = new Date();
    const c = Campaign.reconstitute({
      id: 'id-1', ownerId: 'u1', systemId: 'tormenta20', name: 'C',
      description: '', status: CampaignStatus.ACTIVE,
      settings: { maxPlayers: 4, isPublic: false, allowSpectators: true, xpSystem: 'earned' },
      createdAt: now, updatedAt: now,
    });
    expect(c.id).toBe('id-1');
    expect(c.settings.maxPlayers).toBe(4);
  });
});
