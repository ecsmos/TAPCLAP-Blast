import { hasComponent, query, removeComponent, removeEntity } from 'bitecs';
import { Dying } from '@/game/components/Dying';
import { Falling } from '@/game/components/Falling';
import { ScreenPosition } from '@/game/components/ScreenPosition';
import { Spawning } from '@/game/components/tags';
import type { WorldData } from '@/game/core/World';

export class AnimationSystem {
  private static easeOutCubic(time: number): number {
    const complement = 1 - time;
    return 1 - complement * complement * complement;
  }

  static run(world: WorldData, deltaTime: number): void {
    const falling = query(world, [Falling, ScreenPosition]);
    for (const eid of falling) {
      Falling.elapsed[eid] += deltaTime;
      const progress = Math.min(1, Falling.elapsed[eid] / Falling.duration[eid]);
      const eased = AnimationSystem.easeOutCubic(progress);
      ScreenPosition.row[eid] =
        Falling.fromRow[eid] + (Falling.targetRow[eid] - Falling.fromRow[eid]) * eased;
      ScreenPosition.column[eid] =
        Falling.fromColumn[eid] + (Falling.targetColumn[eid] - Falling.fromColumn[eid]) * eased;
      if (progress >= 1) {
        ScreenPosition.row[eid] = Falling.targetRow[eid];
        ScreenPosition.column[eid] = Falling.targetColumn[eid];
        removeComponent(world, eid, Falling);
        if (hasComponent(world, eid, Spawning)) {
          removeComponent(world, eid, Spawning);
        }
      }
    }

    const dying = query(world, [Dying, ScreenPosition]);
    for (const eid of dying) {
      Dying.elapsed[eid] += deltaTime;
      const progress = Math.min(1, Dying.elapsed[eid] / Dying.duration[eid]);
      ScreenPosition.alpha[eid] = 1 - progress;
      ScreenPosition.scale[eid] = 1 + 0.25 * progress;
      if (progress >= 1) {
        removeEntity(world, eid);
      }
    }

    if (world.state.phase === 'animating') {
      const stillFalling = query(world, [Falling]).length > 0;
      const stillDying = query(world, [Dying]).length > 0;
      if (!stillFalling && !stillDying) {
        world.state.phase = 'idle';
        world.state.gen++;
      }
    }
  }
}
