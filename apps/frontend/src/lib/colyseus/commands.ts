// Re-export COMMANDS constant for use in frontend components
// Mirrors the server-side command types without importing the full service package

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
