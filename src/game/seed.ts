import { getAllEntities, query } from 'bitecs';
import { GridPos } from './components/GridPos';
import { Tile } from './components/Tile';
import { hasAnyMove } from './services/Solvability';
import { createTile, randomColor } from './services/TileFactory';
import { TileKind } from './types';
import type { BlastWorld } from './world';

/**
 * Populates an empty world with a fresh field of ordinary color tiles.
 * Guarantees that the starting board has at least one playable move.
 */
export function seedField(world: BlastWorld, rng: () => number = Math.random): void {
  const { rows, cols, colors } = world.config;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      createTile(world, randomColor(rng, colors), TileKind.Color, r, c);
    }
  }

  rebuildField(world);

  // Reshuffle colors until at least one move exists.
  for (let guard = 0; guard < 50 && !hasAnyMove(world.field); guard++) {
    const eids = query(world, [Tile, GridPos]);
    for (let i = eids.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const ci = Tile.color[eids[i]];
      Tile.color[eids[i]] = Tile.color[eids[j]];
      Tile.color[eids[j]] = ci;
    }
  }
}

/** Rebuilds the FieldModel grid from live entities. */
export function rebuildField(world: BlastWorld): void {
  const all = getAllEntities(world);
  world.field.rebuildFrom(world, all);
}
