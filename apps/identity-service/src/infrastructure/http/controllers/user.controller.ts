import {
  Controller,
  Get,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { JwtAuthGuard, CurrentUser } from '@vtt/shared-auth';
import type { JwtPayload } from '@vtt/shared-types';
import { hashIp } from '@vtt/shared-utils';
import { UserService } from '../../../application/user.service';

@ApiTags('users')
@Controller('v1/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.userService.getProfile(user.sub);
  }

  @Get('me/data')
  @ApiOperation({ summary: 'LGPD — Export all personal data (Art. 18)' })
  @ApiResponse({ status: 200, description: 'Full data export in JSON' })
  async exportData(@CurrentUser() user: JwtPayload, @Res() reply: FastifyReply) {
    const data = await this.userService.exportData(user.sub);
    void reply
      .header('Content-Disposition', `attachment; filename="vtt-data-export-${user.sub}.json"`)
      .header('Content-Type', 'application/json')
      .send(data);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'LGPD — Delete account and schedule data purge (Art. 18)' })
  @ApiResponse({ status: 204, description: 'Account soft-deleted, purge scheduled in 30 days' })
  async deleteMe(@CurrentUser() user: JwtPayload, @Req() req: FastifyRequest) {
    const ipHash = hashIp(req.ip ?? '');
    await this.userService.deleteAccount(user.sub, ipHash);
  }
}
