import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  ValidateNested,
  ArrayMaxSize,
  MaxLength,
  MinLength,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntryType, GameSystem } from '../../../domain/entry/entry.entity';

export class AttributeDto {
  @ApiProperty() @IsString() key!: string;
  @ApiProperty() value!: unknown;
  @ApiPropertyOptional() @IsString() @IsOptional() label?: string;
}

export class RelationDto {
  @ApiProperty({ enum: ['requires', 'enhances', 'conflicts', 'replaces'] })
  @IsIn(['requires', 'enhances', 'conflicts', 'replaces'])
  type!: string;

  @ApiProperty() @IsString() targetId!: string;
  @ApiProperty() @IsString() targetName!: string;
}

export class SourceDto {
  @ApiProperty() @IsString() book!: string;
  @ApiPropertyOptional() @IsInt() @IsOptional() page?: number;
  @ApiPropertyOptional() @IsString() @IsOptional() url?: string;
}

export class CreateEntryDto {
  @ApiProperty({ minLength: 1, maxLength: 200 })
  @IsString() @MinLength(1) @MaxLength(200)
  name!: string;

  @ApiProperty({ maxLength: 50000 })
  @IsString() @MaxLength(50000)
  description!: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsString() @MaxLength(500) @IsOptional()
  shortDescription?: string;

  @ApiProperty({ enum: EntryType })
  @IsEnum(EntryType)
  type!: string;

  @ApiProperty({ enum: ['tormenta20', 'dnd5e', 'shadowrun', 'custom'] })
  @IsIn(['tormenta20', 'dnd5e', 'shadowrun', 'custom'])
  system!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray() @IsString({ each: true }) @ArrayMaxSize(20) @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ type: [AttributeDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => AttributeDto) @IsOptional()
  attributes?: AttributeDto[];

  @ApiPropertyOptional({ type: [RelationDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => RelationDto) @IsOptional()
  relations?: RelationDto[];

  @ApiPropertyOptional({ type: SourceDto })
  @ValidateNested() @Type(() => SourceDto) @IsOptional()
  source?: SourceDto;

  @ApiPropertyOptional({ default: true })
  @IsBoolean() @IsOptional()
  isPublic?: boolean;
}

export class UpdateEntryDto {
  @ApiPropertyOptional() @IsString() @MaxLength(200) @IsOptional() name?: string;
  @ApiPropertyOptional() @IsString() @MaxLength(50000) @IsOptional() description?: string;
  @ApiPropertyOptional() @IsString() @MaxLength(500) @IsOptional() shortDescription?: string;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsString({ each: true }) @IsOptional() tags?: string[];
  @ApiPropertyOptional({ type: [AttributeDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => AttributeDto) @IsOptional() attributes?: AttributeDto[];
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isPublic?: boolean;
}

export class BulkImportEntryDto extends CreateEntryDto {}

export class BulkImportDto {
  @ApiProperty({ type: [BulkImportEntryDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => BulkImportEntryDto)
  @ArrayMaxSize(500)
  entries!: BulkImportEntryDto[];

  @ApiPropertyOptional({ description: 'Overwrite existing entries with same slug' })
  @IsBoolean() @IsOptional()
  overwrite?: boolean;
}

export class SearchEntriesQueryDto {
  @IsOptional() @IsIn(['tormenta20', 'dnd5e', 'shadowrun', 'custom']) system?: string;
  @IsOptional() @IsEnum(EntryType) type?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : undefined))
  @IsArray() @IsString({ each: true })
  tags?: string[];

  @IsOptional() @IsString() q?: string;
  @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean() isOfficial?: boolean;
  @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean() isHomebrew?: boolean;

  @IsOptional() @Transform(({ value }) => parseInt(value as string, 10)) @IsInt() @Min(1) page?: number;
  @IsOptional() @Transform(({ value }) => parseInt(value as string, 10)) @IsInt() @Min(1) @Max(50) limit?: number;

  @IsOptional() @IsIn(['name', 'createdAt', 'updatedAt']) sortBy?: string;
  @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: string;
}
