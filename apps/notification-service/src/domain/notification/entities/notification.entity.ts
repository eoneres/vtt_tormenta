import { generateId } from '@vtt/shared-utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'campaign_invite'         // Invited to a campaign
  | 'session_starting'        // GM started a session
  | 'session_reminder'        // Session starts in 30 min
  | 'campaign_message'        // Message in campaign board
  | 'character_level_up'      // Character leveled up
  | 'marketplace_sale'        // Your homebrew content sold
  | 'marketplace_purchase'    // Purchase confirmed
  | 'system_announcement'     // Platform-wide announcement
  | 'follow'                  // Someone followed you
  | 'homebrew_approved';      // Homebrew approved for marketplace

export type NotificationChannel = 'in_app' | 'email' | 'push';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationStatus = 'pending' | 'delivered' | 'read' | 'failed' | 'dismissed';

export interface NotificationAction {
  label: string;
  url: string;
  primary?: boolean;
}

export interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  actions?: NotificationAction[];
  metadata?: Record<string, unknown>;
}

export interface NotificationProps {
  id: string;
  userId: string;           // recipient
  senderId?: string | undefined;        // who triggered it (user or 'system')
  type: NotificationType;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  status: NotificationStatus;
  payload: NotificationPayload;
  expiresAt?: Date | undefined;
  readAt?: Date | undefined;
  deliveredAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Aggregate ────────────────────────────────────────────────────────────────

export class Notification {
  readonly id: string;
  readonly userId: string;
  readonly senderId?: string | undefined;
  readonly type: NotificationType;
  readonly priority: NotificationPriority;
  readonly channels: NotificationChannel[];
  readonly payload: NotificationPayload;
  readonly expiresAt?: Date | undefined;
  readonly createdAt: Date;

  status: NotificationStatus;
  readAt?: Date | undefined;
  deliveredAt?: Date | undefined;
  updatedAt: Date;

  private constructor(props: NotificationProps) {
    Object.assign(this, props);
    this.id = props.id;
    this.userId = props.userId;
    this.senderId = props.senderId;
    this.type = props.type;
    this.priority = props.priority;
    this.channels = props.channels;
    this.status = props.status;
    this.payload = props.payload;
    this.expiresAt = props.expiresAt;
    this.readAt = props.readAt;
    this.deliveredAt = props.deliveredAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<NotificationProps, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Notification {
    const now = new Date();
    return new Notification({
      ...props,
      id: generateId(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: NotificationProps): Notification {
    return new Notification(props);
  }

  markDelivered(): void {
    this.status = 'delivered';
    this.deliveredAt = new Date();
    this.updatedAt = new Date();
  }

  markRead(): void {
    this.status = 'read';
    this.readAt = new Date();
    this.updatedAt = new Date();
  }

  markFailed(): void {
    this.status = 'failed';
    this.updatedAt = new Date();
  }

  dismiss(): void {
    this.status = 'dismissed';
    this.updatedAt = new Date();
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return this.expiresAt < new Date();
  }

  isUnread(): boolean {
    return this.status === 'delivered' || this.status === 'pending';
  }

  toPlainObject(): NotificationProps {
    return {
      id: this.id,
      userId: this.userId,
      senderId: this.senderId,
      type: this.type,
      priority: this.priority,
      channels: this.channels,
      status: this.status,
      payload: this.payload,
      expiresAt: this.expiresAt,
      readAt: this.readAt,
      deliveredAt: this.deliveredAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

// ─── User Preferences ─────────────────────────────────────────────────────────

export interface NotificationPreferences {
  userId: string;
  channels: Partial<Record<NotificationChannel, boolean>>;
  types: Partial<Record<NotificationType, boolean>>;
  quietHours?: {
    enabled: boolean;
    startHour: number;  // 0-23 UTC
    endHour: number;
  };
  updatedAt: Date;
}

export const DEFAULT_PREFERENCES = (userId: string): NotificationPreferences => ({
  userId,
  channels: { in_app: true, email: true, push: false },
  types: {},
  updatedAt: new Date(),
});
