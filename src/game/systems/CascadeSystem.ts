import { addComponent, hasComponent, query } from 'bitecs';
import { Dying } from '../components/Dying';
import { Falling } from '../components/Falling';
import { GridPos } from '../components/GridPos';
import { ScreenPos } from '../components/ScreenPos';
import { Tile } from '../components/Tile';
import type { System } from '../scheduler';

/**
 * Gravity step. After DestroySystem clears cells, collapses each column so
 * surviving tiles settle at the bottom. Only mutates logical state
 * (GridPos, Falling); the visual interpolation happens in AnimationSystem.
 */
export const CascadeSystem: System = (world) => {
  if (world.state.phase !== 'animating') return;

  const { rows, cols, fallDuration } = world.config;
  const { field } = world;

  // Skip if no tiles are currently dying this frame AND no cells are empty
  // below live tiles — nothing to do. The cheapest check is just to try.

  let anyMoved = false;

  // Collect live tiles (not dying) by column.
  const allTiles = query(world, [Tile, GridPos]);
  const columnEids: number[][] = Array.from({ length: cols }, () => []);

  for (const eid of allTiles) {
    if (hasComponent(world, eid, Dying)) continue;
    columnEids[GridPos.col[eid]].push(eid);
  }

  for (let c = 0; c < cols; c++) {
    // Sort ascending by row: top-most first.
    const list = columnEids[c];
    list.sort((a, b) => GridPos.row[a] - GridPos.row[b]);

    // Walk from bottom upward, assigning the lowest still-unclaimed row.
    let writeRow = rows - 1;
    for (let i = list.length - 1; i >= 0; i--) {
      const eid = list[i];
      const oldRow = GridPos.row[eid];
      if (oldRow !== writeRow) {
        // Set up falling animation from current (visual) row to new row.
        const fromRow = ScreenPos.row[eid];
        GridPos.row[eid] = writeRow;
        field.setEid(oldRow, c, 0); // vacate
        field.setEid(writeRow, c, eid);

        addComponent(world, eid, Falling);
        Falling.fromRow[eid] = fromRow;
        Falling.fromCol[eid] = ScreenPos.col[eid];
        Falling.targetRow[eid] = writeRow;
        Falling.targetCol[eid] = c;
        Falling.elapsed[eid] = 0;
        Falling.duration[eid] = fallDuration;
        anyMoved = true;
      }
      writeRow--;
    }
  }

  if (anyMoved) world.state.gen++;
};
