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
import { AutomationsController } from './infrastructure/http/controllers/automations.controller';
import {
  CreateAutomationUseCase,
  GetAutomationUseCase,
  ListTemplatesUseCase,
  ToggleAutomationUseCase,
  DeleteAutomationUseCase,
  FireAutomationsByTriggerUseCase,
  AutomationRepository,
} from './application/automation/automation.use-cases';
import { AutomationExecutor } from './domain/automation/entities/automation-executor';
import { rulesEnv } from './config/rules.env';
import { join } from 'path';

// ─── Stub GameStateAdapter for development (replace with Redis/WS adapter in prod) ───
class StubGameStateAdapter {
  async getTokenHp() { return { hp: 30, maxHp: 50 }; }
  async setTokenHp() {}
  async getTokenConditions() { return [] as string[]; }
  async addTokenCondition() {}
  async removeTokenCondition() {}
  async sendChatMessage(_tableId: string, msg: string) { console.log('[ChatMsg]', msg); }
}

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [rulesEnv] })],
  controllers: [
    RollsController,
    SystemsController,
    FormulasController,
    SandboxController,
    AutomationsController,
  ],
  providers: [
    // Core engine providers
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

    // Automation providers
    AutomationRepository,
    {
      provide: AutomationExecutor,
      useFactory: (diceEngine: DiceEngine) => {
        const stateAdapter = new StubGameStateAdapter();
        return new AutomationExecutor(diceEngine, stateAdapter as any);
      },
      inject: [DiceEngine],
    },
    CreateAutomationUseCase,
    GetAutomationUseCase,
    ListTemplatesUseCase,
    ToggleAutomationUseCase,
    DeleteAutomationUseCase,
    FireAutomationsByTriggerUseCase,
  ],
})
export class RulesEngineModule {}
