import { IsString, IsOptional, IsBoolean, IsEnum, IsInt, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CampaignSettingsDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(20) maxPlayers?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublic?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() allowSpectators?: boolean;
  @ApiPropertyOptional({ enum: ['milestone', 'earned'] })
  @IsOptional() @IsEnum(['milestone', 'earned']) xpSystem?: 'milestone' | 'earned';
}

export class CreateCampaignDto {
  @ApiProperty({ example: 'A Maldição de Arton' }) @IsString() name!: string;
  @ApiProperty({ example: 'tormenta20' }) @IsString() systemId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ type: CampaignSettingsDto })
  @IsOptional() @ValidateNested() @Type(() => CampaignSettingsDto)
  settings?: CampaignSettingsDto;
}

export class UpdateCampaignDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ type: CampaignSettingsDto })
  @IsOptional() @ValidateNested() @Type(() => CampaignSettingsDto)
  settings?: CampaignSettingsDto;
}

export class CreateCharacterDto {
  @ApiProperty({ example: 'Aldric, o Guerreiro' }) @IsString() name!: string;
  @ApiProperty({ example: 'campaign-uuid' }) @IsString() campaignId!: string;
  @ApiPropertyOptional() @IsOptional() sheetData?: Record<string, unknown>;
}

export class UpdateSheetDto {
  @ApiProperty() sheetData!: Record<string, unknown>;
}

export class CreateTableDto {
  @ApiProperty({ example: 'Mesa Principal' }) @IsString() name!: string;
  @ApiProperty({ example: 'campaign-uuid' }) @IsString() campaignId!: string;
}
