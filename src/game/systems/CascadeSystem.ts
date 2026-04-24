import { addComponent, hasComponent, query } from 'bitecs';
import { Dying } from '@/game/components/Dying';
import { Falling } from '@/game/components/Falling';
import { GridPosition } from '@/game/components/GridPosition';
import { ScreenPosition } from '@/game/components/ScreenPosition';
import { Tile } from '@/game/components/Tile';
import type { WorldData } from '@/game/core/World';

export class CascadeSystem {
  static run(world: WorldData, _deltaTime: number): void {
    if (world.state.phase !== 'animating') return;

    const { rows, columns, fallDuration } = world.config;
    const { gridService } = world;

    let anyMoved = false;

    const allTiles = query(world, [Tile, GridPosition]);
    const columnEids: number[][] = Array.from({ length: columns }, () => []);

    for (const eid of allTiles) {
      if (hasComponent(world, eid, Dying)) continue;
      columnEids[GridPosition.column[eid]].push(eid);
    }

    for (let column = 0; column < columns; column++) {
      const list = columnEids[column];
      list.sort((entityA, entityB) => GridPosition.row[entityA] - GridPosition.row[entityB]);

      let writeRow = rows - 1;
      for (let i = list.length - 1; i >= 0; i--) {
        const eid = list[i];
        const oldRow = GridPosition.row[eid];
        if (oldRow !== writeRow) {
          const fromRow = ScreenPosition.row[eid];
          GridPosition.row[eid] = writeRow;
          gridService.setEid(oldRow, column, 0);
          gridService.setEid(writeRow, column, eid);

          addComponent(world, eid, Falling);
          Falling.fromRow[eid] = fromRow;
          Falling.fromColumn[eid] = ScreenPosition.column[eid];
          Falling.targetRow[eid] = writeRow;
          Falling.targetColumn[eid] = column;
          Falling.elapsed[eid] = 0;
          Falling.duration[eid] = fallDuration;
          anyMoved = true;
        }
        writeRow--;
      }
    }

    if (anyMoved) world.state.gen++;
  }
}
