import { z } from 'zod';

// ─── Command Types ────────────────────────────────────────────────────────────

export const COMMANDS = {
  MOVE_TOKEN: 'MOVE_TOKEN',
  ROLL_DICE: 'ROLL_DICE',
  UPDATE_HP: 'UPDATE_HP',
  APPLY_CONDITION: 'APPLY_CONDITION',
  REMOVE_CONDITION: 'REMOVE_CONDITION',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  SET_INITIATIVE: 'SET_INITIATIVE',
  NEXT_TURN: 'NEXT_TURN',
  START_COMBAT: 'START_COMBAT',
  END_COMBAT: 'END_COMBAT',
  REVEAL_FOG: 'REVEAL_FOG',
  RESET_FOG: 'RESET_FOG',
  PING: 'PING',
} as const;

export type CommandType = (typeof COMMANDS)[keyof typeof COMMANDS];

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const MoveTokenSchema = z.object({
  type: z.literal(COMMANDS.MOVE_TOKEN),
  tokenId: z.string().uuid(),
  x: z.number().finite(),
  y: z.number().finite(),
});

export const RollDiceSchema = z.object({
  type: z.literal(COMMANDS.ROLL_DICE),
  notation: z.string().min(2).max(64),
  characterId: z.string().uuid().optional(),
  label: z.string().max(64).optional(),
  isPrivate: z.boolean().default(false),
});

export const UpdateHpSchema = z.object({
  type: z.literal(COMMANDS.UPDATE_HP),
  tokenId: z.string().uuid(),
  delta: z.number().int(), // positive = heal, negative = damage
  source: z.string().max(64).optional(),
});

export const ApplyConditionSchema = z.object({
  type: z.literal(COMMANDS.APPLY_CONDITION),
  tokenId: z.string().uuid(),
  conditionId: z.string().min(1).max(64),
});

export const RemoveConditionSchema = z.object({
  type: z.literal(COMMANDS.REMOVE_CONDITION),
  tokenId: z.string().uuid(),
  conditionId: z.string().min(1).max(64),
});

export const ChatMessageSchema = z.object({
  type: z.literal(COMMANDS.CHAT_MESSAGE),
  content: z.string().min(1).max(2000),
  isEmote: z.boolean().default(false),
});

export const SetInitiativeSchema = z.object({
  type: z.literal(COMMANDS.SET_INITIATIVE),
  entries: z.array(
    z.object({
      tokenId: z.string().uuid(),
      initiative: z.number().int(),
    }),
  ),
});

export const NextTurnSchema = z.object({
  type: z.literal(COMMANDS.NEXT_TURN),
});

export const StartCombatSchema = z.object({
  type: z.literal(COMMANDS.START_COMBAT),
});

export const EndCombatSchema = z.object({
  type: z.literal(COMMANDS.END_COMBAT),
});

export const RevealFogSchema = z.object({
  type: z.literal(COMMANDS.REVEAL_FOG),
  tokenId: z.string().uuid(),
  polygon: z.array(z.object({ x: z.number(), y: z.number() })),
});

export const ResetFogSchema = z.object({
  type: z.literal(COMMANDS.RESET_FOG),
});

export const PingSchema = z.object({
  type: z.literal(COMMANDS.PING),
});

// ─── Union ────────────────────────────────────────────────────────────────────

export const AnyCommandSchema = z.discriminatedUnion('type', [
  MoveTokenSchema,
  RollDiceSchema,
  UpdateHpSchema,
  ApplyConditionSchema,
  RemoveConditionSchema,
  ChatMessageSchema,
  SetInitiativeSchema,
  NextTurnSchema,
  StartCombatSchema,
  EndCombatSchema,
  RevealFogSchema,
  ResetFogSchema,
  PingSchema,
]);

export type AnyCommand = z.infer<typeof AnyCommandSchema>;
export type MoveTokenCommand = z.infer<typeof MoveTokenSchema>;
export type RollDiceCommand = z.infer<typeof RollDiceSchema>;
export type UpdateHpCommand = z.infer<typeof UpdateHpSchema>;
export type ApplyConditionCommand = z.infer<typeof ApplyConditionSchema>;
export type RemoveConditionCommand = z.infer<typeof RemoveConditionSchema>;
export type ChatMessageCommand = z.infer<typeof ChatMessageSchema>;
export type SetInitiativeCommand = z.infer<typeof SetInitiativeSchema>;
export type RevealFogCommand = z.infer<typeof RevealFogSchema>;
