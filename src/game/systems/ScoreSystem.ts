import { query } from 'bitecs';
import { Dying } from '@/game/components/Dying';
import type { WorldData } from '@/game/core/World';

export class ScoreSystem {
  private static computeScore(n: number): number {
    if (n < 2) return 0;
    return 10 * n + 5 * (n - 2) ** 2;
  }

  static run(world: WorldData, _deltaTime: number): void {
    const dying = query(world, [Dying]);
    let freshCount = 0;
    for (const eid of dying) {
      if (Dying.elapsed[eid] === 0) freshCount++;
    }
    if (freshCount === 0) return;

    const delta = ScoreSystem.computeScore(freshCount);
    if (delta <= 0) return;

    world.state.score += delta;
    world.bus.emit('score:changed', world.state.score);
  }
}
