import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GridType } from '@vtt/shared-types';

export class PositionDto {
  @ApiProperty() @IsNumber() x!: number;
  @ApiProperty() @IsNumber() y!: number;
}

export class CreateMapDto {
  @ApiProperty() @IsString() campaignId!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() imageUrl!: string;
  @ApiProperty({ enum: GridType }) @IsEnum(GridType) gridType!: GridType;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(10) gridSize?: number;
  @ApiProperty() @IsNumber() @Min(100) width!: number;
  @ApiProperty() @IsNumber() @Min(100) height!: number;
}

export class PlaceTokenDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() imageUrl!: string;
  @ApiProperty({ type: PositionDto }) @ValidateNested() @Type(() => PositionDto) position!: PositionDto;
  @ApiPropertyOptional() @IsOptional() @IsString() characterId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() npcId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) size?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() hp?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() maxHp?: number;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() controlledBy?: string[];
}

export class MoveTokenDto {
  @ApiProperty({ type: PositionDto }) @ValidateNested() @Type(() => PositionDto) position!: PositionDto;
}

export class AddWallDto {
  @ApiProperty({ type: PositionDto }) @ValidateNested() @Type(() => PositionDto) start!: PositionDto;
  @ApiProperty({ type: PositionDto }) @ValidateNested() @Type(() => PositionDto) end!: PositionDto;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() blocksLight?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() blocksMovement?: boolean;
}
