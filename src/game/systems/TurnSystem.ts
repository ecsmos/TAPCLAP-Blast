import type { WorldData } from '@/game/core/World';

export class TurnSystem {
  static run(world: WorldData, _deltaTime: number): void {
    const { state, bus } = world;
    if (!state.turnConsumed) return;

    state.turnConsumed = false;

    if (state.movesLeft > 0) {
      state.movesLeft--;
      bus.emit('moves:changed', state.movesLeft);
    }
  }
}
