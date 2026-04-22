import { GridPos } from '../components/GridPos';
import type { BlastWorld } from '../world';

/**
 * Lightweight 2D index over the ECS world. Maintains a dense
 * `rows x cols` grid of entity ids (0 = empty cell). Rebuild after every
 * grid mutation — rebuilding is O(rows*cols) which is <100 ops for a 9x9.
 *
 * The grid is the **only** source of truth for "what is at (row, col)" that
 * systems should read, because GridPos components may temporarily disagree
 * during animations.
 */
export class FieldModel {
  private readonly rows: number;
  private readonly cols: number;
  private readonly grid: Int32Array;

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.grid = new Int32Array(rows * cols);
  }

  private idx(row: number, col: number): number {
    return row * this.cols + col;
  }

  inBounds(row: number, col: number): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  getEid(row: number, col: number): number {
    if (!this.inBounds(row, col)) return 0;
    return this.grid[this.idx(row, col)];
  }

  setEid(row: number, col: number, eid: number): void {
    if (!this.inBounds(row, col)) return;
    this.grid[this.idx(row, col)] = eid;
  }

  clear(): void {
    this.grid.fill(0);
  }

  /** Rebuild from all entities currently holding GridPos (not dying/falling). */
  rebuildFrom(_world: BlastWorld, aliveEids: readonly number[]): void {
    this.clear();
    for (const eid of aliveEids) {
      const r = GridPos.row[eid];
      const c = GridPos.col[eid];
      if (this.inBounds(r, c)) {
        this.grid[this.idx(r, c)] = eid;
      }
    }
  }

  get width(): number {
    return this.cols;
  }
  get height(): number {
    return this.rows;
  }
}
