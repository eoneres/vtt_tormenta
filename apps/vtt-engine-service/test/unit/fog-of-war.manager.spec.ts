import { FogOfWarManager } from '../../src/domain/fog/entities/fog-of-war.manager';
import type { FogOfWarState } from '@vtt/shared-types';

describe('FogOfWarManager', () => {
  let manager: FogOfWarManager;
  let emptyState: FogOfWarState;

  beforeEach(() => {
    manager = new FogOfWarManager();
    emptyState = { mode: 'global', revealedAreas: [] };
  });

  it('reveals area around token', () => {
    const state = manager.revealAroundToken(emptyState, 'token-1', { x: 0, y: 0 }, 100, []);
    expect(state.revealedAreas).toHaveLength(1);
    expect(state.revealedAreas[0]!.tokenId).toBe('token-1');
    expect(state.revealedAreas[0]!.polygon.length).toBeGreaterThan(0);
  });

  it('replaces existing revealed area for same token', () => {
    let state = manager.revealAroundToken(emptyState, 'token-1', { x: 0, y: 0 }, 100, []);
    state = manager.revealAroundToken(state, 'token-1', { x: 200, y: 200 }, 100, []);
    expect(state.revealedAreas).toHaveLength(1);
  });

  it('accumulates revealed areas for different tokens', () => {
    let state = manager.revealAroundToken(emptyState, 'token-1', { x: 0, y: 0 }, 100, []);
    state = manager.revealAroundToken(state, 'token-2', { x: 500, y: 500 }, 100, []);
    expect(state.revealedAreas).toHaveLength(2);
  });

  it('isRevealed returns false for empty state', () => {
    expect(manager.isRevealed(emptyState, { x: 50, y: 50 })).toBe(false);
  });

  it('isRevealed returns true for point inside revealed polygon', () => {
    // Create a large square polygon around origin
    const state: FogOfWarState = {
      mode: 'global',
      revealedAreas: [{
        tokenId: 'token-1',
        polygon: [
          { x: -100, y: -100 },
          { x: 100, y: -100 },
          { x: 100, y: 100 },
          { x: -100, y: 100 },
        ],
      }],
    };
    expect(manager.isRevealed(state, { x: 0, y: 0 })).toBe(true);
  });

  it('isRevealed returns false for point outside polygon', () => {
    const state: FogOfWarState = {
      mode: 'global',
      revealedAreas: [{
        tokenId: 'token-1',
        polygon: [
          { x: -10, y: -10 },
          { x: 10, y: -10 },
          { x: 10, y: 10 },
          { x: -10, y: 10 },
        ],
      }],
    };
    expect(manager.isRevealed(state, { x: 500, y: 500 })).toBe(false);
  });

  it('reset clears all revealed areas', () => {
    let state = manager.revealAroundToken(emptyState, 'token-1', { x: 0, y: 0 }, 100, []);
    state = manager.reset(state);
    expect(state.revealedAreas).toHaveLength(0);
  });
});
