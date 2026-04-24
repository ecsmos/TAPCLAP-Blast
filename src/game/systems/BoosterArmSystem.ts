import { query, removeComponent } from 'bitecs';
import { Selected } from '@/game/components/tags';
import type { WorldData } from '@/game/core/World';

export class BoosterArmSystem {
  private static clearSelection(world: WorldData): void {
    const selectedEids = query(world, [Selected]);
    for (const eid of selectedEids) removeComponent(world, eid, Selected);
  }

  static run(world: WorldData, _deltaTime: number): void {
    const { state, intentService, bus } = world;
    const queued = intentService.drain();

    for (const intent of queued) {
      if (intent.type !== 'booster') {
        intentService.push(intent);
        continue;
      }
      if (state.phase !== 'idle') continue;

      const { id } = intent;
      if (state.boosters[id] <= 0) continue;

      if (state.armedBooster === id) {
        state.armedBooster = null;
        bus.emit('booster:armed', null);
        BoosterArmSystem.clearSelection(world);
        continue;
      }

      state.armedBooster = id;
      state.teleportFirstEid = 0;
      BoosterArmSystem.clearSelection(world);
      bus.emit('booster:armed', id);
    }
  }
}
