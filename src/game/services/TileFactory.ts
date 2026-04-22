import { addComponent, addEntity } from 'bitecs';
import { GridPos } from '../components/GridPos';
import { ScreenPos } from '../components/ScreenPos';
import { Tile } from '../components/Tile';
import { Spawning } from '../components/tags';
import { ALL_COLORS, type TileColor, type TileKind } from '../types';
import type { BlastWorld } from '../world';

/**
 * Creates a tile entity with the full set of components required for it
 * to render and be targetable. Does NOT touch the FieldModel; callers must
 * rebuild the field afterwards.
 */
export function createTile(
  world: BlastWorld,
  color: TileColor,
  kind: TileKind,
  row: number,
  col: number,
): number {
  const eid = addEntity(world);

  addComponent(world, eid, Tile);
  addComponent(world, eid, GridPos);
  addComponent(world, eid, ScreenPos);

  Tile.color[eid] = color;
  Tile.kind[eid] = kind;

  GridPos.row[eid] = row;
  GridPos.col[eid] = col;

  ScreenPos.row[eid] = row;
  ScreenPos.col[eid] = col;
  ScreenPos.alpha[eid] = 1;
  ScreenPos.scale[eid] = 1;

  addComponent(world, eid, Spawning);

  return eid;
}

/** Picks a random color from the configured palette. */
export function randomColor(rng: () => number, colors: number): TileColor {
  const idx = Math.floor(rng() * colors);
  return ALL_COLORS[Math.min(idx, colors - 1)];
}
