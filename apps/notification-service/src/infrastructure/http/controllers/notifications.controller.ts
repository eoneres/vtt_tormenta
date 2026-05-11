import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  Res,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { NotificationService } from '../../application/use-cases/notification.service';
import type { NotificationChannel, NotificationType } from '../../domain/notification/entities/notification.entity';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

class SendNotificationDto {
  targetUserId!: string;
  type!: NotificationType;
  title!: string;
  body!: string;
  channels?: NotificationChannel[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  imageUrl?: string;
  actions?: Array<{ label: string; url: string; primary?: boolean }>;
}

class UpdatePreferencesDto {
  channels?: { in_app?: boolean; email?: boolean; push?: boolean };
  types?: Partial<Record<string, boolean>>;
  quietHours?: { enabled: boolean; startHour: number; endHour: number };
}

// ─── Controller ───────────────────────────────────────────────────────────────

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('v1/notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationService) {}

  // ─── SSE stream (real-time in-app delivery) ────────────────────────────

  @Get('stream')
  @ApiOperation({
    summary: 'Server-Sent Events stream for real-time in-app notifications',
    description: 'Connect to receive live notifications. Keep-alive pings sent every 30s.',
  })
  async stream(
    @Headers('x-user-id') userId: string,
    @Res() reply: FastifyReply,
  ) {
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
    reply.raw.flushHeaders();

    // Send initial connected event
    reply.raw.write('event: connected\ndata: {"status":"connected"}\n\n');

    // Keep-alive ping every 30s
    const keepAlive = setInterval(() => {
      reply.raw.write(': ping\n\n');
    }, 30_000);

    // Register SSE writer
    const cleanup = this.svc.registerSseSession(userId, (data) => {
      reply.raw.write(data);
    });

    // On client disconnect
    reply.raw.on('close', () => {
      clearInterval(keepAlive);
      cleanup();
    });

    // Send existing unread notifications on connect
    const { notifications } = this.svc.getForUser(userId, 10);
    for (const n of notifications.filter((n) => n.isUnread())) {
      reply.raw.write(`data: ${JSON.stringify(n.toPlainObject())}\n\n`);
    }
  }

  // ─── Fetch notifications ───────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get notifications for the authenticated user' })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 20 })
  @ApiQuery({ name: 'offset', type: Number, required: false, example: 0 })
  list(
    @Headers('x-user-id') userId: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.svc.getForUser(userId, Math.min(limit, 50), offset);
  }

  // ─── Mark read ────────────────────────────────────────────────────────

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a notification as read' })
  markRead(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    const success = this.svc.markRead(userId, id);
    return { success };
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@Headers('x-user-id') userId: string) {
    const count = this.svc.markAllRead(userId);
    return { markedRead: count };
  }

  // ─── Dismiss ──────────────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Dismiss a notification' })
  dismiss(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    this.svc.dismiss(userId, id);
  }

  // ─── Preferences ──────────────────────────────────────────────────────

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  getPreferences(@Headers('x-user-id') userId: string) {
    return this.svc.getPreferences(userId);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  updatePreferences(
    @Headers('x-user-id') userId: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.svc.updatePreferences(userId, dto as any);
  }

  // ─── Admin: send notification (internal service-to-service) ──────────

  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send a notification to a user (internal service call)',
    description: 'Used by other services (campaign-service, rules-engine, etc.) to trigger notifications.',
  })
  async send(
    @Body() dto: SendNotificationDto,
    @Headers('x-service-key') serviceKey: string,
  ) {
    // In production: validate x-service-key against shared secret
    const notification = await this.svc.send({
      userId: dto.targetUserId,
      type: dto.type,
      priority: dto.priority,
      channels: dto.channels ?? ['in_app'],
      payload: {
        title: dto.title,
        body: dto.body,
        imageUrl: dto.imageUrl,
        actions: dto.actions,
      },
    });
    return notification.toPlainObject();
  }
}
