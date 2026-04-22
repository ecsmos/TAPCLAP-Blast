import type { System } from '../scheduler';

/**
 * Decrements moves when the current tick produced a consumed turn.
 * Acts as a single authority so multiple interactions within one tick
 * can't double-decrement (e.g. chain reactions from super-tiles).
 */
export const TurnSystem: System = (world) => {
  const { state, bus } = world;
  if (!state.turnConsumed) return;

  state.turnConsumed = false;

  if (state.movesLeft > 0) {
    state.movesLeft--;
    bus.emit('moves:changed', state.movesLeft);
  }
};
