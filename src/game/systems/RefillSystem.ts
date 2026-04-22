import { addComponent } from 'bitecs';
import { Falling } from '../components/Falling';
import { ScreenPos } from '../components/ScreenPos';
import type { System } from '../scheduler';
import { createTile, randomColor } from '../services/TileFactory';
import { TileKind } from '../types';

/**
 * After CascadeSystem compacts each column, fill the empty cells at the
 * top with freshly spawned tiles that "drop in" from above the board.
 */
export const RefillSystem: System = (world) => {
  if (world.state.phase !== 'animating') return;

  const { rows, cols, colors, fallDuration } = world.config;
  const { field } = world;

  for (let c = 0; c < cols; c++) {
    let spawnAbove = 0;
    for (let r = 0; r < rows; r++) {
      if (field.getEid(r, c) !== 0) continue;

      spawnAbove++;
      const eid = createTile(world, randomColor(Math.random, colors), TileKind.Color, r, c);
      field.setEid(r, c, eid);

      // Enter from above the board. The farther above, the longer it takes,
      // but we cap the duration so all cells finish together-ish.
      ScreenPos.row[eid] = -spawnAbove;
      ScreenPos.col[eid] = c;

      addComponent(world, eid, Falling);
      Falling.fromRow[eid] = -spawnAbove;
      Falling.fromCol[eid] = c;
      Falling.targetRow[eid] = r;
      Falling.targetCol[eid] = c;
      Falling.elapsed[eid] = 0;
      Falling.duration[eid] = fallDuration;
    }
  }
};
