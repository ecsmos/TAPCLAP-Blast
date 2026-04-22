import { Tile } from '../components/Tile';
import { TileKind } from '../types';
import type { FieldModel } from './FieldModel';

/**
 * 4-connected flood fill across same-colored ordinary tiles.
 *
 * Super-tiles don't participate in color matching: they are their own
 * group of size 1 and activate an area effect on click instead.
 */
export function floodFill(field: FieldModel, row: number, col: number): number[] {
  const origin = field.getEid(row, col);
  if (origin === 0) return [];

  const originKind = Tile.kind[origin] as TileKind;
  if (originKind !== TileKind.Color) {
    return [origin];
  }

  const originColor = Tile.color[origin];
  const visited = new Set<number>();
  const group: number[] = [];
  const stack: Array<[number, number]> = [[row, col]];

  while (stack.length > 0) {
    const cell = stack.pop();
    if (!cell) break;
    const [r, c] = cell;
    if (!field.inBounds(r, c)) continue;
    const eid = field.getEid(r, c);
    if (eid === 0 || visited.has(eid)) continue;
    if ((Tile.kind[eid] as TileKind) !== TileKind.Color) continue;
    if (Tile.color[eid] !== originColor) continue;

    visited.add(eid);
    group.push(eid);

    stack.push([r + 1, c]);
    stack.push([r - 1, c]);
    stack.push([r, c + 1]);
    stack.push([r, c - 1]);
  }

  return group;
}
