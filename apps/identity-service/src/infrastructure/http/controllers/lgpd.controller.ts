import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean, IsString } from 'class-validator';
import { LgpdService, ConsentRecord } from '../../../application/lgpd/lgpd.service';

class RecordConsentDto {
  @IsEnum(['analytics', 'marketing', 'third_party', 'data_processing'])
  type!: ConsentRecord['type'];

  @IsBoolean()
  granted!: boolean;
}

class ExportDataDto {
  @IsEnum(['json', 'csv'])
  @IsOptional()
  format?: 'json' | 'csv';
}

/**
 * LgpdController
 *
 * Implements LGPD Art. 18 data subject rights:
 * - GET  /v1/lgpd/info              — data processing information (public)
 * - GET  /v1/lgpd/:userId/export    — export user data (user/admin)
 * - DELETE /v1/lgpd/:userId         — erasure request (user/admin)
 * - GET  /v1/lgpd/:userId/consents  — current consents
 * - POST /v1/lgpd/:userId/consents  — record consent
 * - DELETE /v1/lgpd/:userId/consents/:type — revoke consent
 */
@ApiTags('LGPD / Privacy')
@Controller('v1/lgpd')
export class LgpdController {
  constructor(private readonly lgpdService: LgpdService) {}

  // ─── Public info ───────────────────────────────────────────────────────

  @Get('info')
  @ApiOperation({
    summary: 'Data processing information (Art. 18 LGPD)',
    description: 'Returns full privacy policy, purposes, retention periods, and user rights.',
  })
  @ApiResponse({ status: 200, description: 'Data processing information' })
  getDataProcessingInfo() {
    return this.lgpdService.getDataProcessingInfo();
  }

  // ─── Data Export (Portability) ────────────────────────────────────────

  @Get(':userId/export')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Export all personal data for a user (Art. 18 V — Portability)',
    description: 'Aggregates all personal data across services. User can only export own data.',
  })
  @ApiParam({ name: 'userId', description: 'User ID to export data for' })
  @ApiResponse({ status: 200, description: 'Complete personal data export' })
  @ApiResponse({ status: 403, description: 'Cannot export data for another user' })
  async exportData(
    @Param('userId') userId: string,
    @Headers('x-user-id') requesterId: string,
    @Body() dto: ExportDataDto,
  ) {
    return this.lgpdService.exportUserData({
      userId,
      requestedBy: requesterId ?? userId,
      format: dto.format ?? 'json',
    });
  }

  // ─── Right to Erasure ─────────────────────────────────────────────────

  @Delete(':userId')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request erasure of personal data (Art. 18 IV & VI — Right to erasure)',
    description:
      'Initiates data erasure across all services. ' +
      'Financial records retained 5 years per legal obligation (Lei 9.613). ' +
      'Account PII is anonymized rather than deleted to maintain audit trail integrity.',
  })
  @ApiParam({ name: 'userId', description: 'User ID to erase data for' })
  @ApiResponse({ status: 200, description: 'Erasure result with actions taken per service' })
  async requestErasure(
    @Param('userId') userId: string,
    @Headers('x-user-id') requesterId: string,
    @Body('anonymizeOnly') anonymizeOnly?: boolean,
    @Body('reason') reason?: string,
  ) {
    return this.lgpdService.requestErasure({
      userId,
      requestedBy: requesterId ?? userId,
      reason,
      anonymizeOnly,
    });
  }

  // ─── Consent Management ───────────────────────────────────────────────

  @Get(':userId/consents')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current consents for a user' })
  async getConsents(
    @Param('userId') userId: string,
    @Headers('x-user-id') requesterId: string,
  ) {
    return this.lgpdService.getCurrentConsents(userId);
  }

  @Post(':userId/consents')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record a consent decision' })
  async recordConsent(
    @Param('userId') userId: string,
    @Body() dto: RecordConsentDto,
    @Headers('x-user-id') requesterId: string,
    @Headers('x-forwarded-for') ip: string = '0.0.0.0',
  ) {
    await this.lgpdService.recordConsent({
      userId,
      type: dto.type,
      granted: dto.granted,
      ipAddress: ip,
      timestamp: new Date(),
    });
    return { success: true, message: `Consent for ${dto.type} recorded as: ${dto.granted ? 'granted' : 'revoked'}` };
  }

  @Delete(':userId/consents/:type')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke consent for a specific purpose (Art. 18 IX)',
  })
  async revokeConsent(
    @Param('userId') userId: string,
    @Param('type') type: ConsentRecord['type'],
    @Headers('x-user-id') requesterId: string,
    @Headers('x-forwarded-for') ip: string = '0.0.0.0',
  ) {
    await this.lgpdService.revokeConsent(userId, type, ip);
    return { success: true, message: `Consent for ${type} revoked` };
  }
}
