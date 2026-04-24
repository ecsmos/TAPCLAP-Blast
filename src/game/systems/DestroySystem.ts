import { addComponent, query, removeComponent } from 'bitecs';
import { Dying } from '@/game/components/Dying';
import { GridPosition } from '@/game/components/GridPosition';
import { Matched } from '@/game/components/tags';
import type { WorldData } from '@/game/core/World';

export class DestroySystem {
  static run(world: WorldData, _deltaTime: number): void {
    const toKill = query(world, [Matched, GridPosition]);
    if (toKill.length === 0) return;

    const { destroyDuration } = world.config;

    for (const eid of toKill) {
      removeComponent(world, eid, Matched);
      addComponent(world, eid, Dying);
      Dying.elapsed[eid] = 0;
      Dying.duration[eid] = destroyDuration;
      world.gridService.setEid(GridPosition.row[eid], GridPosition.column[eid], 0);
    }

    world.state.gen++;
  }
}
