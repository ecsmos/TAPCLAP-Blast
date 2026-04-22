import { Tile } from '../components/Tile';
import { TileKind } from '../types';
import type { FieldModel } from './FieldModel';

/**
 * Check whether the current board has at least one playable move:
 *   - any super-tile exists (clicking it always burns something), or
 *   - there exists a pair of horizontally/vertically adjacent ordinary
 *     tiles of the same color (minimal burnable group size = 2).
 *
 * O(rows * cols).
 */
export function hasAnyMove(field: FieldModel): boolean {
  const rows = field.height;
  const cols = field.width;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const eid = field.getEid(r, c);
      if (eid === 0) continue;
      const kind = Tile.kind[eid] as TileKind;

      if (kind !== TileKind.Color) {
        // Any super-tile is a valid click.
        return true;
      }

      const color = Tile.color[eid];

      const right = field.getEid(r, c + 1);
      if (
        right !== 0 &&
        (Tile.kind[right] as TileKind) === TileKind.Color &&
        Tile.color[right] === color
      ) {
        return true;
      }

      const down = field.getEid(r + 1, c);
      if (
        down !== 0 &&
        (Tile.kind[down] as TileKind) === TileKind.Color &&
        Tile.color[down] === color
      ) {
        return true;
      }
    }
  }

  return false;
}
