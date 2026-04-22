/**
 * Engine-level types that don't depend on bitecs, Pixi or React.
 */

export const MAX_ENTITIES = 512;

/** Distinct playable colors of ordinary tiles. */
export enum TileColor {
  Blue = 0,
  Red = 1,
  Green = 2,
  Yellow = 3,
  Pink = 4,
}

export const ALL_COLORS: readonly TileColor[] = [
  TileColor.Blue,
  TileColor.Red,
  TileColor.Green,
  TileColor.Yellow,
  TileColor.Pink,
];

/**
 * Logical kind of a tile. Ordinary tiles have `Color` kind and rely on
 * `Tile.color[eid]` to know which of the 5 colors they are. Super-tiles
 * ignore the color channel for matching; they activate an area effect when
 * clicked.
 */
export enum TileKind {
  Color = 0,
  /** Single-cell booster placed by the bomb booster (kept for future). */
  Bomb = 1,
  /** Super-tile variants. */
  Striped = 2, // row
  Wrapped = 3, // column
  Radial = 4, // radius
  SuperBomb = 5, // whole field
}

export const SUPER_TILE_KINDS: readonly TileKind[] = [
  TileKind.Striped,
  TileKind.Wrapped,
  TileKind.Radial,
  TileKind.SuperBomb,
];

export function isSuperKind(kind: TileKind): boolean {
  return (
    kind === TileKind.Striped ||
    kind === TileKind.Wrapped ||
    kind === TileKind.Radial ||
    kind === TileKind.SuperBomb
  );
}

/** Top-level game state machine. */
export type GamePhase = 'idle' | 'resolving' | 'animating' | 'shuffling' | 'win' | 'lose';

/** Available boosters. */
export type BoosterId = 'bomb' | 'teleport' | 'shuffle';

/** Grid coordinates. (0,0) is top-left. */
export interface Cell {
  row: number;
  col: number;
}
