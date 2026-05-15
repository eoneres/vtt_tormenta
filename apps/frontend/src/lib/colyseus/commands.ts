// Re-export COMMANDS constant for use in frontend components
// Mirrors the server-side command types without importing the full service package

export const COMMANDS = {
  // Token
  MOVE_TOKEN:        'MOVE_TOKEN',
  UPDATE_HP:         'UPDATE_HP',
  UPDATE_TOKEN_HP:   'UPDATE_TOKEN_HP',
  APPLY_CONDITION:   'APPLY_CONDITION',
  REMOVE_CONDITION:  'REMOVE_CONDITION',
  SET_TOKEN_LIGHT:   'SET_TOKEN_LIGHT',
  TOGGLE_TOKEN_VISIBLE: 'TOGGLE_TOKEN_VISIBLE',

  // Dice
  ROLL_DICE: 'ROLL_DICE',

  // Chat
  CHAT_MESSAGE: 'CHAT_MESSAGE',

  // Combat
  SET_INITIATIVE: 'SET_INITIATIVE',
  NEXT_TURN:      'NEXT_TURN',
  START_COMBAT:   'START_COMBAT',
  END_COMBAT:     'END_COMBAT',

  // Fog & Lighting
  REVEAL_FOG: 'REVEAL_FOG',
  HIDE_FOG:   'HIDE_FOG',
  RESET_FOG:  'RESET_FOG',
  ADD_MAP_LIGHT:    'ADD_MAP_LIGHT',
  REMOVE_MAP_LIGHT: 'REMOVE_MAP_LIGHT',

  // Map
  CHANGE_MAP: 'CHANGE_MAP',

  // Session
  PING: 'PING',
  REQUEST_SYNC: 'REQUEST_SYNC',
} as const;

export type CommandType = (typeof COMMANDS)[keyof typeof COMMANDS];

