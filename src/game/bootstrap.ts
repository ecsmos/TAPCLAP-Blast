import { getAllEntities, query } from 'bitecs';
import { GridPosition } from '@/game/components/GridPosition';
import { Tile, TileType } from '@/game/components/Tile';
import type { WorldData } from '@/game/core/World';

export const bootstrap = (world: WorldData, rng: () => number = Math.random): void => {
  const { rows, columns, variants } = world.config;
  const { tileFactory } = world;

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      tileFactory.create(
        world,
        tileFactory.randomVariant(rng, variants),
        TileType.Color,
        row,
        column,
      );
    }
  }

  const entities = getAllEntities(world);
  world.gridService.rebuild(world, entities);

  for (let guard = 0; guard < 50 && !world.gridService.canPlay(); guard++) {
    const eids = query(world, [Tile, GridPosition]);
    for (let i = eids.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const holdVariant = Tile.variant[eids[i]];
      Tile.variant[eids[i]] = Tile.variant[eids[j]];
      Tile.variant[eids[j]] = holdVariant;
    }
  }
};
