import { TileColor } from '../game/types';

/** Palette for placeholder tiles. Matches the reference screenshot vibes. */
export const TILE_PALETTE: Record<TileColor, number> = {
  [TileColor.Blue]: 0x3fb8ff,
  [TileColor.Red]: 0xff5a52,
  [TileColor.Green]: 0x6ddc5b,
  [TileColor.Yellow]: 0xffcc3d,
  [TileColor.Pink]: 0xff6bd2,
};

export const TILE_HIGHLIGHT: Record<TileColor, number> = {
  [TileColor.Blue]: 0xbfe7ff,
  [TileColor.Red]: 0xffb6b2,
  [TileColor.Green]: 0xc6f1bd,
  [TileColor.Yellow]: 0xffe9a6,
  [TileColor.Pink]: 0xffc2ea,
};
