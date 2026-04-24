import { GridPosition } from '@/game/components/GridPosition';
import { Tile, TileType } from '@/game/components/Tile';
import type { WorldData } from '@/game/core/World';

export class GridService {
  private readonly rows: number;
  private readonly columns: number;
  private readonly grid: Int32Array;

  constructor(rows: number, columns: number) {
    this.rows = rows;
    this.columns = columns;
    this.grid = new Int32Array(rows * columns);
  }

  private idx(row: number, column: number): number {
    return row * this.columns + column;
  }

  get width(): number {
    return this.columns;
  }

  get height(): number {
    return this.rows;
  }

  inBounds(row: number, column: number): boolean {
    return row >= 0 && row < this.rows && column >= 0 && column < this.columns;
  }

  getEid(row: number, column: number): number {
    if (!this.inBounds(row, column)) return 0;

    return this.grid[this.idx(row, column)];
  }

  setEid(row: number, column: number, eid: number): void {
    if (!this.inBounds(row, column)) return;

    this.grid[this.idx(row, column)] = eid;
  }

  clear(): void {
    this.grid.fill(0);
  }

  rebuild(_world: WorldData, aliveEids: readonly number[]): void {
    this.clear();

    for (const eid of aliveEids) {
      const row = GridPosition.row[eid];
      const column = GridPosition.column[eid];

      if (this.inBounds(row, column)) {
        this.grid[this.idx(row, column)] = eid;
      }
    }
  }

  fill(row: number, column: number): number[] {
    const origin = this.getEid(row, column);
    if (origin === 0) return [];

    const originType = Tile.type[origin] as TileType;
    if (originType !== TileType.Color) {
      return [origin];
    }

    const originVariant = Tile.variant[origin];
    const visited = new Set<number>();
    const group: number[] = [];
    const stack: Array<[number, number]> = [[row, column]];

    while (stack.length > 0) {
      const cell = stack.pop();
      if (!cell) break;

      const [row, column] = cell;
      if (!this.inBounds(row, column)) continue;

      const eid = this.getEid(row, column);
      if (eid === 0 || visited.has(eid)) continue;
      if ((Tile.type[eid] as TileType) !== TileType.Color) continue;
      if (Tile.variant[eid] !== originVariant) continue;

      visited.add(eid);
      group.push(eid);

      stack.push([row + 1, column]);
      stack.push([row - 1, column]);
      stack.push([row, column + 1]);
      stack.push([row, column - 1]);
    }

    return group;
  }

  canPlay(): boolean {
    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        const eid = this.getEid(row, column);
        if (eid === 0) continue;

        const type = Tile.type[eid] as TileType;
        if (type !== TileType.Color) {
          return true;
        }

        const variant = Tile.variant[eid];

        const right = this.getEid(row, column + 1);
        if (
          right !== 0 &&
          (Tile.type[right] as TileType) === TileType.Color &&
          Tile.variant[right] === variant
        ) {
          return true;
        }

        const down = this.getEid(row + 1, column);
        if (
          down !== 0 &&
          (Tile.type[down] as TileType) === TileType.Color &&
          Tile.variant[down] === variant
        ) {
          return true;
        }
      }
    }

    return false;
  }
}
