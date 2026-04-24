import { addComponent, addEntity } from 'bitecs';
import { GridPosition } from '@/game/components/GridPosition';
import { ScreenPosition } from '@/game/components/ScreenPosition';
import { TILE_VARIANTS, Tile, type TileType, type TileVariant } from '@/game/components/Tile';
import { Spawning } from '@/game/components/tags';
import type { WorldData } from '@/game/core/World';

export class TileFactory {
  create(
    world: WorldData,
    variant: TileVariant,
    type: TileType,
    row: number,
    column: number,
  ): number {
    const eid = addEntity(world);

    addComponent(world, eid, Tile);
    addComponent(world, eid, GridPosition);
    addComponent(world, eid, ScreenPosition);

    Tile.variant[eid] = variant;
    Tile.type[eid] = type;

    GridPosition.row[eid] = row;
    GridPosition.column[eid] = column;

    ScreenPosition.row[eid] = row;
    ScreenPosition.column[eid] = column;
    ScreenPosition.alpha[eid] = 1;
    ScreenPosition.scale[eid] = 1;

    addComponent(world, eid, Spawning);

    return eid;
  }

  randomVariant(rng: () => number, variants: number): TileVariant {
    const idx = Math.floor(rng() * variants);
    return TILE_VARIANTS[Math.min(idx, variants - 1)];
  }
}
