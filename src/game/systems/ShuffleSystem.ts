import { addComponent, query } from 'bitecs';
import { Falling } from '@/game/components/Falling';
import { GridPosition } from '@/game/components/GridPosition';
import { ScreenPosition } from '@/game/components/ScreenPosition';
import { isSuperType, Tile, type TileType } from '@/game/components/Tile';
import type { WorldData } from '@/game/core/World';

export class ShuffleSystem {
  private static performShuffle(world: WorldData): void {
    const rawEids = query(world, [Tile, GridPosition, ScreenPosition]);
    if (rawEids.length === 0) return;
    const eids: number[] = Array.from(rawEids);

    const movable: number[] = eids.filter(
      (entityId) => !isSuperType(Tile.type[entityId] as TileType),
    );
    const positions: Array<{ row: number; column: number }> = movable.map((entityId) => ({
      row: GridPosition.row[entityId],
      column: GridPosition.column[entityId],
    }));

    for (let attempt = 0; attempt < 10; attempt++) {
      for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = positions[i];
        positions[i] = positions[j];
        positions[j] = tmp;
      }
      for (let i = 0; i < movable.length; i++) {
        const eid = movable[i];
        const { row, column } = positions[i];
        const fromRow = ScreenPosition.row[eid];
        const fromColumn = ScreenPosition.column[eid];
        GridPosition.row[eid] = row;
        GridPosition.column[eid] = column;

        addComponent(world, eid, Falling);
        Falling.fromRow[eid] = fromRow;
        Falling.fromColumn[eid] = fromColumn;
        Falling.targetRow[eid] = row;
        Falling.targetColumn[eid] = column;
        Falling.elapsed[eid] = 0;
        Falling.duration[eid] = world.config.swapDuration;
      }
      world.gridService.clear();
      for (const entityId of eids) {
        world.gridService.setEid(
          GridPosition.row[entityId],
          GridPosition.column[entityId],
          entityId,
        );
      }
      if (world.gridService.canPlay()) return;
    }
  }

  static run(world: WorldData, _deltaTime: number): void {
    const { state, bus } = world;

    if (state.phase !== 'idle' && state.phase !== 'shuffling') return;

    if (state.armedBooster === 'shuffle' && state.boosters.shuffle > 0) {
      ShuffleSystem.performShuffle(world);
      state.boosters.shuffle--;
      state.armedBooster = null;
      bus.emit('booster:armed', null);
      bus.emit('boosters:changed', { ...state.boosters });
      state.phase = 'animating';
      return;
    }

    if (world.gridService.canPlay()) return;

    if (state.shuffleTries >= world.config.maxShuffleTries) {
      state.phase = 'lose';
      bus.emit('phase:changed', state.phase);
      bus.emit('game:lost', { score: state.score, reason: 'shuffle' });
      return;
    }

    ShuffleSystem.performShuffle(world);
    state.shuffleTries++;
    bus.emit('shuffle:performed', { tries: state.shuffleTries });
    state.phase = 'animating';
  }
}
