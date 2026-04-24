import type { WorldData } from '@/game/core/World';

export class WinLoseSystem {
  static run(world: WorldData, _deltaTime: number): void {
    const { state, config, bus } = world;
    if (state.phase !== 'idle') return;

    if (state.score >= config.scoreTarget) {
      state.phase = 'win';
      bus.emit('phase:changed', state.phase);
      bus.emit('game:won', { score: state.score });
      return;
    }

    if (state.movesLeft <= 0) {
      state.phase = 'lose';
      bus.emit('phase:changed', state.phase);
      bus.emit('game:lost', { score: state.score, reason: 'moves' });
    }
  }
}
