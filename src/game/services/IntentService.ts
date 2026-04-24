import type { BoosterType, Cell } from '@/game/core/World';

interface CellTapIntent {
  type: 'cell';
  cell: Cell;
}

interface BoosterArmIntent {
  type: 'booster';
  id: BoosterType;
}

interface RestartIntent {
  type: 'restart';
}

export type Intent = CellTapIntent | BoosterArmIntent | RestartIntent;

export class IntentService {
  private readonly buffer: Intent[] = [];

  push(intent: Intent): void {
    this.buffer.push(intent);
  }

  drain(): Intent[] {
    if (this.buffer.length === 0) return [];

    const out = this.buffer.slice();
    this.buffer.length = 0;

    return out;
  }
}
