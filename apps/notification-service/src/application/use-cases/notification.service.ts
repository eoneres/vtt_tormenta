import { Injectable, Logger } from '@nestjs/common';
import {
  Notification,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationPayload,
  NotificationPreferences,
  DEFAULT_PREFERENCES,
} from '../domain/notification/entities/notification.entity';

// ─── In-memory stores (replace with Redis/PostgreSQL in production) ──────────
const notificationStore = new Map<string, Notification[]>();          // userId → notifications
const preferencesStore  = new Map<string, NotificationPreferences>(); // userId → prefs
const sseSessions       = new Map<string, (data: string) => void>();  // userId → SSE writer

// ─── Channel-specific sender stubs ────────────────────────────────────────────

interface IEmailSender {
  send(to: string, subject: string, body: string): Promise<void>;
}

interface IPushSender {
  send(userId: string, payload: NotificationPayload): Promise<void>;
}

class StubEmailSender implements IEmailSender {
  private readonly logger = new Logger('EmailSender');
  async send(to: string, subject: string, body: string) {
    this.logger.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
  }
}

class StubPushSender implements IPushSender {
  private readonly logger = new Logger('PushSender');
  async send(userId: string, payload: NotificationPayload) {
    this.logger.log(`[PUSH] UserId: ${userId} | Title: ${payload.title}`);
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly email: IEmailSender = new StubEmailSender();
  private readonly push: IPushSender = new StubPushSender();

  // ─── Create & Deliver ──────────────────────────────────────────────────

  async send(opts: {
    userId: string;
    senderId?: string;
    type: NotificationType;
    priority?: NotificationPriority;
    channels?: NotificationChannel[];
    payload: NotificationPayload;
    expiresAt?: Date;
  }): Promise<Notification> {
    const prefs = this.getPreferences(opts.userId);

    // Filter channels by user preferences
    const requestedChannels = opts.channels ?? ['in_app'];
    const allowedChannels = requestedChannels.filter((ch) => {
      if (!prefs.channels[ch]) return false;
      if (prefs.types[opts.type] === false) return false;
      if (prefs.quietHours?.enabled && this.isQuietHour(prefs)) {
        return ch === 'in_app'; // Always deliver in-app even in quiet hours
      }
      return true;
    });

    const notification = Notification.create({
      userId: opts.userId,
      senderId: opts.senderId,
      type: opts.type,
      priority: opts.priority ?? 'normal',
      channels: allowedChannels.length > 0 ? allowedChannels : ['in_app'],
      payload: opts.payload,
      expiresAt: opts.expiresAt,
    });

    // Store
    const userNotifications = notificationStore.get(opts.userId) ?? [];
    userNotifications.unshift(notification);
    // Keep last 100 notifications per user
    notificationStore.set(opts.userId, userNotifications.slice(0, 100));

    // Deliver to each channel
    await this.deliver(notification);
    return notification;
  }

  async sendBulk(userIds: string[], opts: Omit<Parameters<NotificationService['send']>[0], 'userId'>): Promise<void> {
    await Promise.allSettled(
      userIds.map((userId) => this.send({ ...opts, userId })),
    );
  }

  private async deliver(notification: Notification): Promise<void> {
    const deliveryResults = await Promise.allSettled(
      notification.channels.map((ch) => this.deliverToChannel(ch, notification)),
    );

    const anySuccess = deliveryResults.some((r) => r.status === 'fulfilled');
    anySuccess ? notification.markDelivered() : notification.markFailed();

    this.logger.debug(
      `Notification ${notification.id} (${notification.type}) → ` +
      `${notification.channels.join(',')} → ${notification.status}`,
    );
  }

  private async deliverToChannel(channel: NotificationChannel, n: Notification): Promise<void> {
    switch (channel) {
      case 'in_app':
        await this.deliverInApp(n);
        break;
      case 'email':
        await this.email.send(
          n.userId,
          n.payload.title,
          n.payload.body,
        );
        break;
      case 'push':
        await this.push.send(n.userId, n.payload);
        break;
    }
  }

  private async deliverInApp(notification: Notification): Promise<void> {
    const writer = sseSessions.get(notification.userId);
    if (writer) {
      const event = `data: ${JSON.stringify(notification.toPlainObject())}\n\n`;
      writer(event);
    }
  }

  // ─── SSE Registration ──────────────────────────────────────────────────

  registerSseSession(userId: string, writer: (data: string) => void): () => void {
    sseSessions.set(userId, writer);
    this.logger.debug(`SSE session registered for user ${userId}`);
    // Return cleanup function
    return () => {
      sseSessions.delete(userId);
      this.logger.debug(`SSE session removed for user ${userId}`);
    };
  }

  // ─── Queries ───────────────────────────────────────────────────────────

  getForUser(userId: string, limit = 20, offset = 0): {
    notifications: Notification[];
    total: number;
    unreadCount: number;
  } {
    const all = notificationStore.get(userId) ?? [];
    const active = all.filter((n) => !n.isExpired());
    return {
      notifications: active.slice(offset, offset + limit),
      total: active.length,
      unreadCount: active.filter((n) => n.isUnread()).length,
    };
  }

  markRead(userId: string, notificationId: string): boolean {
    const notifications = notificationStore.get(userId) ?? [];
    const n = notifications.find((n) => n.id === notificationId);
    if (!n || n.userId !== userId) return false;
    n.markRead();
    return true;
  }

  markAllRead(userId: string): number {
    const notifications = notificationStore.get(userId) ?? [];
    let count = 0;
    for (const n of notifications) {
      if (n.isUnread()) { n.markRead(); count++; }
    }
    return count;
  }

  dismiss(userId: string, notificationId: string): boolean {
    const notifications = notificationStore.get(userId) ?? [];
    const n = notifications.find((n) => n.id === notificationId);
    if (!n || n.userId !== userId) return false;
    n.dismiss();
    return true;
  }

  // ─── Preferences ───────────────────────────────────────────────────────

  getPreferences(userId: string): NotificationPreferences {
    return preferencesStore.get(userId) ?? DEFAULT_PREFERENCES(userId);
  }

  updatePreferences(userId: string, patch: Partial<NotificationPreferences>): NotificationPreferences {
    const current = this.getPreferences(userId);
    const updated: NotificationPreferences = {
      ...current,
      ...patch,
      userId,
      channels: { ...current.channels, ...patch.channels },
      types: { ...current.types, ...patch.types },
      updatedAt: new Date(),
    };
    preferencesStore.set(userId, updated);
    return updated;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────

  private isQuietHour(prefs: NotificationPreferences): boolean {
    if (!prefs.quietHours?.enabled) return false;
    const hour = new Date().getUTCHours();
    const { startHour, endHour } = prefs.quietHours;
    if (startHour <= endHour) return hour >= startHour && hour < endHour;
    return hour >= startHour || hour < endHour; // crosses midnight
  }
}
