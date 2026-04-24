import { MAX_ENTITIES } from '@/game/config';

export enum TileVariant {
  Blue = 0,
  Red = 1,
  Green = 2,
  Yellow = 3,
  Pink = 4,
}

export const TILE_VARIANTS: readonly TileVariant[] = [
  TileVariant.Blue,
  TileVariant.Red,
  TileVariant.Green,
  TileVariant.Yellow,
  TileVariant.Pink,
];

export enum TileType {
  Color = 0,
  Bomb = 1,
  Striped = 2,
  Wrapped = 3,
  Radial = 4,
  SuperBomb = 5,
}

export const SUPER_TILE_TYPES: readonly TileType[] = [
  TileType.Striped,
  TileType.Wrapped,
  TileType.Radial,
  TileType.SuperBomb,
];

export const isSuperType = (type: TileType): boolean =>
  type === TileType.Striped ||
  type === TileType.Wrapped ||
  type === TileType.Radial ||
  type === TileType.SuperBomb;

export const Tile = {
  variant: new Uint8Array(MAX_ENTITIES),
  type: new Uint8Array(MAX_ENTITIES),
};
