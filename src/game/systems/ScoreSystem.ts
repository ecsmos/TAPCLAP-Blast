import { query } from 'bitecs';
import { Dying } from '../components/Dying';
import type { System } from '../scheduler';
import { computeGroupScore } from '../services/Scoring';

/**
 * Runs once per turn. Counts the number of freshly-destroyed tiles by
 * looking at Dying entities whose `elapsed` is still 0 (i.e. created this
 * tick) and adds a single aggregated score payout.
 */
export const ScoreSystem: System = (world) => {
  const dying = query(world, [Dying]);
  let freshCount = 0;
  for (const eid of dying) {
    if (Dying.elapsed[eid] === 0) freshCount++;
  }
  if (freshCount === 0) return;

  const delta = computeGroupScore(freshCount);
  if (delta <= 0) return;

  world.state.score += delta;
  world.bus.emit('score:changed', world.state.score);
};
