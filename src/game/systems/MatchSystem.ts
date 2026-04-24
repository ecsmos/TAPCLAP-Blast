import { addComponent, removeComponent } from 'bitecs';
import { GridPosition } from '@/game/components/GridPosition';
import { isSuperType, SUPER_TILE_TYPES, Tile, type TileType } from '@/game/components/Tile';
import { Matched, Selected } from '@/game/components/tags';
import type { WorldData } from '@/game/core/World';

export class MatchSystem {
  static run(world: WorldData, _deltaTime: number): void {
    const { state, intentService, gridService, config, bus } = world;

    if (state.armedBooster !== null) return;
    if (state.phase !== 'idle') return;

    const queued = intentService.drain();
    let consumed = false;
    for (let i = 0; i < queued.length; i++) {
      const intent = queued[i];
      if (consumed) {
        intentService.push(intent);
        continue;
      }
      if (intent.type !== 'cell') {
        intentService.push(intent);
        continue;
      }

      const { row, column } = intent.cell;
      const eid = gridService.getEid(row, column);
      if (eid === 0) continue;

      const type = Tile.type[eid] as TileType;

      if (isSuperType(type)) {
        intentService.push(intent);
        continue;
      }

      const group = gridService.fill(row, column);
      if (group.length < 2) continue;

      if (group.length >= config.superThreshold) {
        const superType = SUPER_TILE_TYPES[Math.floor(Math.random() * SUPER_TILE_TYPES.length)];
        Tile.type[eid] = superType;

        for (const id of group) {
          if (id === eid) continue;
          addComponent(world, id, Matched);
        }

        bus.emit('super:spawned', { cell: { row, column }, type: superType });
      } else {
        for (const id of group) {
          addComponent(world, id, Matched);
        }
      }

      if (state.teleportFirstEid !== 0) {
        removeComponent(world, state.teleportFirstEid, Selected);
        state.teleportFirstEid = 0;
      }

      state.turnConsumed = true;
      state.phase = 'animating';
      state.gen++;
      consumed = true;
    }

    void GridPosition;
  }
}
