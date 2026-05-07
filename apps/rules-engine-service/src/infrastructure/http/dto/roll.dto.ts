import { IsString, IsOptional, IsEnum, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RollModifierDto {
  @ApiProperty() @IsString() source!: string;
  @ApiProperty() value!: number;
  @ApiProperty({ enum: ['bonus', 'penalty', 'circumstance', 'status'] })
  @IsEnum(['bonus', 'penalty', 'circumstance', 'status'])
  type!: 'bonus' | 'penalty' | 'circumstance' | 'status';
}

export class RollContextDto {
  @ApiProperty({ enum: ['attack', 'damage', 'skill', 'save', 'initiative', 'custom'] })
  @IsEnum(['attack', 'damage', 'skill', 'save', 'initiative', 'custom'])
  type!: 'attack' | 'damage' | 'skill' | 'save' | 'initiative' | 'custom';

  @ApiPropertyOptional() @IsOptional() advantage?: boolean;
  @ApiPropertyOptional() @IsOptional() disadvantage?: boolean;

  @ApiPropertyOptional({ type: [RollModifierDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => RollModifierDto)
  modifiers?: RollModifierDto[];
}

export class RollRequestDto {
  @ApiProperty({ example: '1d20+5' }) @IsString() notation!: string;
  @ApiProperty({ example: 'tormenta20' }) @IsString() systemId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() characterId?: string;
  @ApiPropertyOptional({ type: RollContextDto })
  @IsOptional() @ValidateNested() @Type(() => RollContextDto)
  context?: RollContextDto;
}

export class EvaluateFormulaDto {
  @ApiProperty({ example: 'floor((value - 10) / 2)' }) @IsString() formula!: string;
  @ApiPropertyOptional({ example: { value: 16 } }) @IsOptional() context?: Record<string, number>;
}
