import type { System } from '../scheduler';

/**
 * Checks terminal conditions after the board has settled. Only fires when
 * we just returned to the `idle` phase (i.e. after an animating pass).
 */
export const WinLoseSystem: System = (world) => {
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
};
