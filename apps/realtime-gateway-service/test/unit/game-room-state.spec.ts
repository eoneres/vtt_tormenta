import { GameRoomState, TokenSchema, PositionSchema } from '../../src/rooms/game-room.state';

describe('GameRoomState', () => {
  let state: GameRoomState;

  beforeEach(() => {
    state = new GameRoomState();
  });

  it('initializes with default values', () => {
    expect(state.phase).toBe('exploration');
    expect(state.round).toBe(0);
    expect(state.turn).toBe(0);
    expect(state.tokens.size).toBe(0);
    expect(state.initiative.length).toBe(0);
    expect(state.chatHistory.length).toBe(0);
  });

  it('can add a token to the map', () => {
    const token = new TokenSchema();
    token.id = 'token-1';
    token.name = 'Guerreiro';
    token.hp = 30;
    token.maxHp = 30;
    token.position = new PositionSchema();
    token.position.x = 140;
    token.position.y = 70;

    state.tokens.set('token-1', token);

    expect(state.tokens.size).toBe(1);
    expect(state.tokens.get('token-1')?.name).toBe('Guerreiro');
    expect(state.tokens.get('token-1')?.position.x).toBe(140);
  });

  it('can remove a token', () => {
    const token = new TokenSchema();
    token.id = 'token-1';
    state.tokens.set('token-1', token);
    state.tokens.delete('token-1');
    expect(state.tokens.size).toBe(0);
  });

  it('tracks connected players', () => {
    state.players.set('session-abc', 'Jogador 1');
    state.players.set('session-def', 'Jogador 2');
    expect(state.players.size).toBe(2);
    state.players.delete('session-abc');
    expect(state.players.size).toBe(1);
  });

  it('fog state initializes with empty revealed areas', () => {
    expect(state.fog.mode).toBe('global');
    expect(state.fog.revealedAreas.length).toBe(0);
  });
});
