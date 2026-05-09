import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class ListEntriesQuery {
  @IsEnum(['tormenta20', 'dnd5e', 'shadowrun'])
  @IsOptional()
  system?: string;

  @IsEnum(['race', 'class', 'spell', 'item', 'monster', 'power'])
  @IsOptional()
  type?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsString()
  @IsOptional()
  query?: string;
}
