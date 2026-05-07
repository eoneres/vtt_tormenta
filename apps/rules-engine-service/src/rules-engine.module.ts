import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiceEngine } from './domain/dice/entities/dice-engine';
import { SystemLoader } from './domain/system/entities/system-loader';
import {
  RollsController,
  SystemsController,
  FormulasController,
  SandboxController,
} from './infrastructure/http/controllers/rules.controller';
import { rulesEnv } from './config/rules.env';
import { join } from 'path';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [rulesEnv] })],
  controllers: [RollsController, SystemsController, FormulasController, SandboxController],
  providers: [
    {
      provide: DiceEngine,
      useFactory: () => new DiceEngine(process.env['DICE_HMAC_SECRET'] ?? 'dev-secret-change-me'),
    },
    {
      provide: SystemLoader,
      useFactory: () => {
        const dir = process.env['SYSTEMS_DIR'] ?? join(process.cwd(), 'systems');
        const loader = new SystemLoader(dir);
        loader.loadAll();
        return loader;
      },
    },
  ],
})
export class RulesEngineModule {}
