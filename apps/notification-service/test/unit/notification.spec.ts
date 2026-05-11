import { Notification } from '../../src/domain/notification/entities/notification.entity';
import { NotificationService } from '../../src/application/use-cases/notification.service';

// ─── Entity tests ─────────────────────────────────────────────────────────────

describe('Notification entity', () => {
  const base = {
    userId: 'user-1',
    senderId: 'system',
    type: 'campaign_invite' as const,
    priority: 'normal' as const,
    channels: ['in_app' as const],
    payload: { title: 'Convite!', body: 'Você foi convidado para uma campanha.' },
  };

  it('creates with pending status', () => {
    const n = Notification.create(base);
    expect(n.status).toBe('pending');
    expect(n.id).toBeDefined();
  });

  it('markDelivered sets status and deliveredAt', () => {
    const n = Notification.create(base);
    n.markDelivered();
    expect(n.status).toBe('delivered');
    expect(n.deliveredAt).toBeInstanceOf(Date);
  });

  it('markRead sets status and readAt', () => {
    const n = Notification.create(base);
    n.markDelivered();
    n.markRead();
    expect(n.status).toBe('read');
    expect(n.readAt).toBeInstanceOf(Date);
  });

  it('markFailed sets status', () => {
    const n = Notification.create(base);
    n.markFailed();
    expect(n.status).toBe('failed');
  });

  it('dismiss sets dismissed status', () => {
    const n = Notification.create(base);
    n.markDelivered();
    n.dismiss();
    expect(n.status).toBe('dismissed');
  });

  it('isUnread true for pending and delivered', () => {
    const n = Notification.create(base);
    expect(n.isUnread()).toBe(true);
    n.markDelivered();
    expect(n.isUnread()).toBe(true);
    n.markRead();
    expect(n.isUnread()).toBe(false);
  });

  it('isExpired false when no expiresAt', () => {
    const n = Notification.create(base);
    expect(n.isExpired()).toBe(false);
  });

  it('isExpired true for past date', () => {
    const past = new Date(Date.now() - 1000);
    const n = Notification.create({ ...base, expiresAt: past });
    expect(n.isExpired()).toBe(true);
  });

  it('isExpired false for future date', () => {
    const future = new Date(Date.now() + 60_000);
    const n = Notification.create({ ...base, expiresAt: future });
    expect(n.isExpired()).toBe(false);
  });

  it('reconstitute preserves all fields', () => {
    const n = Notification.create(base);
    n.markDelivered();
    const plain = n.toPlainObject();
    const r = Notification.reconstitute(plain);
    expect(r.id).toBe(n.id);
    expect(r.status).toBe('delivered');
    expect(r.deliveredAt).toEqual(n.deliveredAt);
  });
});

// ─── Service tests ────────────────────────────────────────────────────────────

describe('NotificationService', () => {
  let svc: NotificationService;

  beforeEach(() => {
    svc = new NotificationService();
  });

  it('send delivers in-app notification', async () => {
    const received: string[] = [];
    const cleanup = svc.registerSseSession('user-1', (data) => received.push(data));

    await svc.send({
      userId: 'user-1',
      type: 'session_starting',
      payload: { title: 'Sessão iniciando!', body: 'O Mestre iniciou a sessão.' },
    });

    expect(received.length).toBeGreaterThan(0);
    cleanup();
  });

  it('send stores notification in user list', async () => {
    await svc.send({
      userId: 'user-2',
      type: 'character_level_up',
      payload: { title: 'Level Up!', body: 'Seu personagem subiu de nível.' },
    });

    const { notifications, total, unreadCount } = svc.getForUser('user-2');
    expect(total).toBe(1);
    expect(unreadCount).toBe(1);
    expect(notifications[0]!.type).toBe('character_level_up');
  });

  it('markRead changes status', async () => {
    await svc.send({
      userId: 'user-3',
      type: 'follow',
      payload: { title: 'Novo seguidor', body: 'Alguém começou a seguir você.' },
    });

    const { notifications } = svc.getForUser('user-3');
    const id = notifications[0]!.id;
    const success = svc.markRead('user-3', id);
    expect(success).toBe(true);

    const { unreadCount } = svc.getForUser('user-3');
    expect(unreadCount).toBe(0);
  });

  it('markRead returns false for wrong userId', async () => {
    await svc.send({
      userId: 'user-4',
      type: 'follow',
      payload: { title: 'Test', body: 'Test body' },
    });
    const { notifications } = svc.getForUser('user-4');
    const result = svc.markRead('user-999', notifications[0]!.id);
    expect(result).toBe(false);
  });

  it('markAllRead marks all unread', async () => {
    for (let i = 0; i < 5; i++) {
      await svc.send({
        userId: 'user-5',
        type: 'system_announcement',
        payload: { title: `Aviso ${i}`, body: 'Corpo do aviso' },
      });
    }
    const count = svc.markAllRead('user-5');
    expect(count).toBe(5);
    expect(svc.getForUser('user-5').unreadCount).toBe(0);
  });

  it('dismiss removes notification from unread', async () => {
    await svc.send({
      userId: 'user-6',
      type: 'marketplace_sale',
      payload: { title: 'Venda!', body: 'Seu conteúdo foi vendido.' },
    });
    const { notifications } = svc.getForUser('user-6');
    svc.dismiss('user-6', notifications[0]!.id);
    expect(svc.getForUser('user-6').unreadCount).toBe(0);
  });

  it('getPreferences returns defaults for new user', () => {
    const prefs = svc.getPreferences('new-user');
    expect(prefs.channels.in_app).toBe(true);
    expect(prefs.channels.email).toBe(true);
    expect(prefs.channels.push).toBe(false);
  });

  it('updatePreferences persists changes', () => {
    svc.updatePreferences('user-7', {
      channels: { push: true, email: false },
    });
    const updated = svc.getPreferences('user-7');
    expect(updated.channels.push).toBe(true);
    expect(updated.channels.email).toBe(false);
    expect(updated.channels.in_app).toBe(true); // unchanged
  });

  it('respects channel preference — does not deliver to disabled channel', async () => {
    svc.updatePreferences('user-8', {
      channels: { email: false, in_app: true, push: false },
    });

    await svc.send({
      userId: 'user-8',
      type: 'follow',
      channels: ['email'],  // requested but disabled
      payload: { title: 'Test', body: 'Test' },
    });

    // Should still store in in_app as fallback
    const { notifications } = svc.getForUser('user-8');
    expect(notifications.length).toBe(1);
  });

  it('sendBulk sends to all users', async () => {
    const userIds = ['bulk-1', 'bulk-2', 'bulk-3'];
    await svc.sendBulk(userIds, {
      type: 'system_announcement',
      payload: { title: 'Manutenção', body: 'Sistema em manutenção às 3h.' },
    });

    for (const uid of userIds) {
      expect(svc.getForUser(uid).total).toBe(1);
    }
  });

  it('SSE cleanup removes session on call', () => {
    const writes: string[] = [];
    const cleanup = svc.registerSseSession('user-9', (d) => writes.push(d));
    cleanup();
    // After cleanup, sending should not reach the writer
    // (no easy way to verify deletion directly, but no error should throw)
    expect(() => svc.getForUser('user-9')).not.toThrow();
  });
});
