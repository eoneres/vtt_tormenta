import { IsArray, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export type EntrySystem = 'tormenta20' | 'dnd5e' | 'shadowrun';
export type EntryType = 'race' | 'class' | 'spell' | 'item' | 'monster' | 'power';

export class EntryContentDto {
  @IsString()
  @IsNotEmpty()
  summary!: string;

  @IsString()
  @IsNotEmpty()
  details!: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class CreateEntryDto {
  @IsEnum(['tormenta20', 'dnd5e', 'shadowrun'])
  system!: EntrySystem;

  @IsEnum(['race', 'class', 'spell', 'item', 'monster', 'power'])
  type!: EntryType;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ValidateNested()
  @Type(() => EntryContentDto)
  content!: EntryContentDto;
}
