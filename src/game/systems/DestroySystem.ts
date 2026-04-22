import { addComponent, query, removeComponent } from 'bitecs';
import { Dying } from '../components/Dying';
import { GridPos } from '../components/GridPos';
import { Matched } from '../components/tags';
import type { System } from '../scheduler';

/**
 * Converts all `Matched` tags into `Dying` components so the animation
 * system can fade them out, then hand them to the cascade system.
 *
 * Runs right after Match/Booster/SuperTile so we always process this
 * frame's destructions in one go.
 */
export const DestroySystem: System = (world) => {
  const toKill = query(world, [Matched, GridPos]);
  if (toKill.length === 0) return;

  const { destroyDuration } = world.config;

  for (const eid of toKill) {
    removeComponent(world, eid, Matched);
    addComponent(world, eid, Dying);
    Dying.elapsed[eid] = 0;
    Dying.duration[eid] = destroyDuration;
    // Immediately vacate the grid: CascadeSystem needs to know the cell is free.
    world.field.setEid(GridPos.row[eid], GridPos.col[eid], 0);
  }

  world.state.gen++;
};
