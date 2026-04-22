import { hasComponent, query, removeComponent, removeEntity } from 'bitecs';
import { Dying } from '../components/Dying';
import { Falling } from '../components/Falling';
import { ScreenPos } from '../components/ScreenPos';
import { Spawning } from '../components/tags';
import type { System } from '../scheduler';

function easeOutCubic(t: number): number {
  const u = 1 - t;
  return 1 - u * u * u;
}

/**
 * Advances every active animation by dt seconds and finalises completed
 * ones. When every animation finishes and no tiles are dying, flips the
 * phase back to `idle` so input can be accepted again.
 */
export const AnimationSystem: System = (world, dt) => {
  // --- Falling ---------------------------------------------------------
  const falling = query(world, [Falling, ScreenPos]);
  for (const eid of falling) {
    Falling.elapsed[eid] += dt;
    const t = Math.min(1, Falling.elapsed[eid] / Falling.duration[eid]);
    const e = easeOutCubic(t);
    ScreenPos.row[eid] = Falling.fromRow[eid] + (Falling.targetRow[eid] - Falling.fromRow[eid]) * e;
    ScreenPos.col[eid] = Falling.fromCol[eid] + (Falling.targetCol[eid] - Falling.fromCol[eid]) * e;
    if (t >= 1) {
      ScreenPos.row[eid] = Falling.targetRow[eid];
      ScreenPos.col[eid] = Falling.targetCol[eid];
      removeComponent(world, eid, Falling);
      if (hasComponent(world, eid, Spawning)) {
        removeComponent(world, eid, Spawning);
      }
    }
  }

  // --- Dying -----------------------------------------------------------
  const dying = query(world, [Dying, ScreenPos]);
  for (const eid of dying) {
    Dying.elapsed[eid] += dt;
    const t = Math.min(1, Dying.elapsed[eid] / Dying.duration[eid]);
    ScreenPos.alpha[eid] = 1 - t;
    ScreenPos.scale[eid] = 1 + 0.25 * t;
    if (t >= 1) {
      removeEntity(world, eid);
    }
  }

  // --- Phase transition ------------------------------------------------
  if (world.state.phase === 'animating') {
    const stillFalling = query(world, [Falling]).length > 0;
    const stillDying = query(world, [Dying]).length > 0;
    if (!stillFalling && !stillDying) {
      world.state.phase = 'idle';
      world.state.gen++;
    }
  }
};
