import { Controller, Post, Get, Body, Param, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RollRequestDto, EvaluateFormulaDto } from '../dto/roll.dto';
import { DiceEngine } from '../../../domain/dice/entities/dice-engine';
import { SystemLoader } from '../../../domain/system/entities/system-loader';
import { FormulaEvaluator } from '../../../domain/formula/entities/formula-evaluator';
import { AutomationSandbox } from '../../sandbox/automation-sandbox';

@ApiTags('rolls')
@ApiBearerAuth()
@Controller('v1/rolls')
export class RollsController {
  constructor(
    private readonly diceEngine: DiceEngine,
    private readonly systemLoader: SystemLoader,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute a dice roll (authoritative server-side)' })
  @ApiResponse({ status: 200, description: 'Roll result with audit signature' })
  roll(
    @Body() dto: RollRequestDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!this.systemLoader.has(dto.systemId)) {
      return { statusCode: 404, error: 'Not Found', message: `System not found: ${dto.systemId}` };
    }
    return this.diceEngine.roll(
      {
        notation: dto.notation,
        systemId: dto.systemId,
        characterId: dto.characterId,
        context: dto.context
      } as any,
      userId ?? 'anonymous',
    );
  }
}

@ApiTags('systems')
@Controller('v1/systems')
export class SystemsController {
  constructor(private readonly systemLoader: SystemLoader) {}

  @Get()
  @ApiOperation({ summary: 'List all loaded RPG systems' })
  list() {
    return this.systemLoader.list().map(({ system, version, name }) => ({ system, version, name }));
  }

  @Get(':systemId')
  @ApiOperation({ summary: 'Get full system definition' })
  get(@Param('systemId') systemId: string) {
    return this.systemLoader.get(systemId);
  }
}

@ApiTags('formulas')
@ApiBearerAuth()
@Controller('v1/formulas')
export class FormulasController {
  private readonly evaluator = new FormulaEvaluator();

  @Post('evaluate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Evaluate a formula expression with context variables' })
  evaluate(@Body() dto: EvaluateFormulaDto) {
    const result = this.evaluator.evaluate(dto.formula, dto.context ?? {});
    return { formula: dto.formula, context: dto.context, result };
  }
}

@ApiTags('sandbox')
@ApiBearerAuth()
@Controller('v1/sandbox')
export class SandboxController {
  private readonly sandbox = new AutomationSandbox();

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute automation script in secure sandbox' })
  execute(@Body() body: { code: string; context?: Record<string, unknown> }) {
    return this.sandbox.execute(body.code, body.context ?? {});
  }
}
