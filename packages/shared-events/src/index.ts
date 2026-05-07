import type { UserRole } from '@vtt/shared-types';

// ─── Base ────────────────────────────────────────────────────────────────────

export interface DomainEvent<T = unknown> {
  eventId: string;
  eventType: string;
  version: string;
  occurredAt: string; // ISO 8601
  traceId: string;
  payload: T;
}

// ─── Exchanges ───────────────────────────────────────────────────────────────

export const EXCHANGES = {
  IDENTITY: 'identity.events',
  CAMPAIGN: 'campaign.events',
  GAME: 'game.events',
  BILLING: 'billing.events',
  NOTIFICATION: 'notification.events',
} as const;

// ─── Identity Events ─────────────────────────────────────────────────────────

export const IDENTITY_EVENTS = {
  USER_REGISTERED: 'user.registered',
  USER_DELETED: 'user.deleted',
  USER_MFA_ENABLED: 'user.mfa_enabled',
  USER_PASSWORD_CHANGED: 'user.password_changed',
  USER_LOGIN_FAILED: 'user.login_failed',
  USER_ACCOUNT_LOCKED: 'user.account_locked',
} as const;

export interface UserRegisteredPayload {
  userId: string;
  email: string;
  displayName: string;
  roles: UserRole[];
}

export interface UserDeletedPayload {
  userId: string;
  deletedAt: string;
  reason: 'user_request' | 'admin_action' | 'lgpd_erasure';
}

export type UserRegisteredEvent = DomainEvent<UserRegisteredPayload>;
export type UserDeletedEvent = DomainEvent<UserDeletedPayload>;

// ─── Campaign Events ─────────────────────────────────────────────────────────

export const CAMPAIGN_EVENTS = {
  CAMPAIGN_CREATED: 'campaign.created',
  CAMPAIGN_DELETED: 'campaign.deleted',
  TABLE_SESSION_STARTED: 'table.session_started',
  TABLE_SESSION_ENDED: 'table.session_ended',
  CHARACTER_UPDATED: 'character.updated',
  PLAYER_JOINED: 'player.joined',
  PLAYER_LEFT: 'player.left',
} as const;

export interface CampaignCreatedPayload {
  campaignId: string;
  ownerId: string;
  systemId: string;
  name: string;
}

export interface TableSessionStartedPayload {
  tableId: string;
  campaignId: string;
  gmId: string;
  playerIds: string[];
  startedAt: string;
}

export type CampaignCreatedEvent = DomainEvent<CampaignCreatedPayload>;
export type TableSessionStartedEvent = DomainEvent<TableSessionStartedPayload>;

// ─── Game Events ─────────────────────────────────────────────────────────────

export const GAME_EVENTS = {
  ROLL_EXECUTED: 'roll.executed',
  TOKEN_MOVED: 'token.moved',
  COMBAT_TURN_CHANGED: 'combat.turn_changed',
  HP_CHANGED: 'hp.changed',
  CONDITION_APPLIED: 'condition.applied',
  CONDITION_REMOVED: 'condition.removed',
  MAP_CHANGED: 'map.changed',
} as const;

export interface RollExecutedPayload {
  rollId: string;
  tableId: string;
  rolledBy: string;
  characterId: string | null;
  notation: string;
  result: number;
  breakdown: string;
  seed: string;
  signature: string;
}

export interface TokenMovedPayload {
  tableId: string;
  tokenId: string;
  movedBy: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export interface HpChangedPayload {
  tableId: string;
  tokenId: string;
  characterId: string | null;
  previousHp: number;
  newHp: number;
  maxHp: number;
  source: string;
  changedBy: string;
}

export type RollExecutedEvent = DomainEvent<RollExecutedPayload>;
export type TokenMovedEvent = DomainEvent<TokenMovedPayload>;
export type HpChangedEvent = DomainEvent<HpChangedPayload>;

// ─── Billing Events ──────────────────────────────────────────────────────────

export const BILLING_EVENTS = {
  SUBSCRIPTION_ACTIVATED: 'subscription.activated',
  SUBSCRIPTION_EXPIRED: 'subscription.expired',
  SUBSCRIPTION_CANCELED: 'subscription.canceled',
  PURCHASE_COMPLETED: 'purchase.completed',
} as const;

export interface SubscriptionActivatedPayload {
  subscriptionId: string;
  userId: string;
  plan: string;
  expiresAt: string;
}

export interface PurchaseCompletedPayload {
  purchaseId: string;
  userId: string;
  itemId: string;
  amount: number;
  currency: string;
}

export type SubscriptionActivatedEvent = DomainEvent<SubscriptionActivatedPayload>;
export type PurchaseCompletedEvent = DomainEvent<PurchaseCompletedPayload>;

// ─── Notification Events ─────────────────────────────────────────────────────

export const NOTIFICATION_EVENTS = {
  SEND_EMAIL: 'notification.send_email',
  SEND_PUSH: 'notification.send_push',
  SEND_IN_APP: 'notification.send_in_app',
} as const;

export interface SendEmailPayload {
  to: string;
  templateId: string;
  variables: Record<string, string>;
  userId: string | null;
}

export interface SendPushPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export type SendEmailEvent = DomainEvent<SendEmailPayload>;
export type SendPushEvent = DomainEvent<SendPushPayload>;
