import { AnyCommandSchema, COMMANDS } from '../../src/commands/game.commands';

describe('AnyCommandSchema', () => {
  it('validates MOVE_TOKEN', () => {
    const result = AnyCommandSchema.safeParse({
      type: COMMANDS.MOVE_TOKEN,
      tokenId: '550e8400-e29b-41d4-a716-446655440000',
      x: 140,
      y: 210,
    });
    expect(result.success).toBe(true);
  });

  it('rejects MOVE_TOKEN with invalid uuid', () => {
    const result = AnyCommandSchema.safeParse({
      type: COMMANDS.MOVE_TOKEN,
      tokenId: 'not-a-uuid',
      x: 0,
      y: 0,
    });
    expect(result.success).toBe(false);
  });

  it('validates ROLL_DICE', () => {
    const result = AnyCommandSchema.safeParse({
      type: COMMANDS.ROLL_DICE,
      notation: '1d20+5',
    });
    expect(result.success).toBe(true);
  });

  it('rejects ROLL_DICE with empty notation', () => {
    const result = AnyCommandSchema.safeParse({
      type: COMMANDS.ROLL_DICE,
      notation: '',
    });
    expect(result.success).toBe(false);
  });

  it('validates UPDATE_HP with negative delta (damage)', () => {
    const result = AnyCommandSchema.safeParse({
      type: COMMANDS.UPDATE_HP,
      tokenId: '550e8400-e29b-41d4-a716-446655440000',
      delta: -5,
    });
    expect(result.success).toBe(true);
  });

  it('validates CHAT_MESSAGE', () => {
    const result = AnyCommandSchema.safeParse({
      type: COMMANDS.CHAT_MESSAGE,
      content: 'Olá, aventureiros!',
    });
    expect(result.success).toBe(true);
  });

  it('rejects CHAT_MESSAGE exceeding max length', () => {
    const result = AnyCommandSchema.safeParse({
      type: COMMANDS.CHAT_MESSAGE,
      content: 'x'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it('validates SET_INITIATIVE with sorted entries', () => {
    const result = AnyCommandSchema.safeParse({
      type: COMMANDS.SET_INITIATIVE,
      entries: [
        { tokenId: '550e8400-e29b-41d4-a716-446655440000', initiative: 18 },
        { tokenId: '550e8400-e29b-41d4-a716-446655440001', initiative: 12 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('validates REVEAL_FOG with polygon', () => {
    const result = AnyCommandSchema.safeParse({
      type: COMMANDS.REVEAL_FOG,
      tokenId: '550e8400-e29b-41d4-a716-446655440000',
      polygon: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects unknown command type', () => {
    const result = AnyCommandSchema.safeParse({
      type: 'UNKNOWN_COMMAND',
      data: {},
    });
    expect(result.success).toBe(false);
  });

  it('validates PING', () => {
    const result = AnyCommandSchema.safeParse({ type: COMMANDS.PING });
    expect(result.success).toBe(true);
  });
});
