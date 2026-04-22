import type { BoosterId, Cell } from './types';

/**
 * Intents are queued commands from the player / UI. Systems drain the
 * queue at the start of each tick. We buffer them (rather than processing
 * directly inside bus listeners) so that per-frame ordering is fully
 * controlled by the Scheduler — no race conditions between React's render
 * cycle and the ECS tick.
 */

export interface CellTapIntent {
  type: 'cell';
  cell: Cell;
}

export interface BoosterArmIntent {
  type: 'booster';
  id: BoosterId;
}

export interface RestartIntent {
  type: 'restart';
}

export type Intent = CellTapIntent | BoosterArmIntent | RestartIntent;

export class IntentQueue {
  private readonly buf: Intent[] = [];

  push(intent: Intent): void {
    this.buf.push(intent);
  }

  drain(): Intent[] {
    if (this.buf.length === 0) return [];
    const out = this.buf.slice();
    this.buf.length = 0;
    return out;
  }

  get size(): number {
    return this.buf.length;
  }
}
