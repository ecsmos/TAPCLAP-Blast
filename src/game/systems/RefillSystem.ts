import { addComponent } from 'bitecs';
import { Falling } from '@/game/components/Falling';
import { ScreenPosition } from '@/game/components/ScreenPosition';
import { TileType } from '@/game/components/Tile';
import type { WorldData } from '@/game/core/World';

export class RefillSystem {
  static run(world: WorldData, _deltaTime: number): void {
    if (world.state.phase !== 'animating') return;

    const { rows, columns, variants, fallDuration } = world.config;
    const { gridService, tileFactory } = world;

    for (let column = 0; column < columns; column++) {
      let spawnAbove = 0;
      for (let row = 0; row < rows; row++) {
        if (gridService.getEid(row, column) !== 0) continue;

        spawnAbove++;
        const eid = tileFactory.create(
          world,
          tileFactory.randomVariant(Math.random, variants),
          TileType.Color,
          row,
          column,
        );
        gridService.setEid(row, column, eid);

        ScreenPosition.row[eid] = -spawnAbove;
        ScreenPosition.column[eid] = column;

        addComponent(world, eid, Falling);
        Falling.fromRow[eid] = -spawnAbove;
        Falling.fromColumn[eid] = column;
        Falling.targetRow[eid] = row;
        Falling.targetColumn[eid] = column;
        Falling.elapsed[eid] = 0;
        Falling.duration[eid] = fallDuration;
      }
    }
  }
}
