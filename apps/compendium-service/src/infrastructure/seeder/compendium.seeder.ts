import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CompendiumEntry } from '../../domain/entry/entry.entity';
import { IEntryRepository } from '../../domain/entry/entry.repository';
import { ALL_T20_SEED_DATA } from './tormenta20.seed-data';

@Injectable()
export class CompendiumSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CompendiumSeederService.name);

  constructor(private readonly repo: IEntryRepository) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env['SEED_ON_BOOT'] !== 'true') return;
    await this.seedTormenta20();
  }

  async seedTormenta20(): Promise<{ inserted: number; skipped: number }> {
    this.logger.log(`Starting Tormenta20 seed with ${ALL_T20_SEED_DATA.length} entries...`);

    let inserted = 0;
    let skipped = 0;

    for (const data of ALL_T20_SEED_DATA) {
      try {
        const slug = CompendiumEntry.slugify(data.name);
        const existing = await this.repo.findBySlug(slug, 'tormenta20');

        if (existing) {
          skipped++;
          continue;
        }

        const entry = CompendiumEntry.create({
          ...data,
          isOfficial: true,
          isHomebrew: false,
          isPublic: true,
          createdBy: 'system',
        });

        await this.repo.save(entry);
        inserted++;
      } catch (err) {
        this.logger.error(`Failed to seed entry "${data.name}"`, err);
      }
    }

    this.logger.log(`Seed complete: ${inserted} inserted, ${skipped} skipped`);
    return { inserted, skipped };
  }
}
