import type { BoosterId, Cell, GamePhase, TileKind } from './types';

/**
 * Typed event map. Keys are event names, values are the payload shape.
 *
 * Convention: `namespace:verb` — commands are `pointer:*`, `booster:*`,
 * state notifications are `score:*`, `moves:*`, `phase:*`, `game:*`.
 */
export interface BusEvents {
  /** Player pressed on a field cell. */
  'pointer:cell': Cell;
  /** Booster icon in the HUD was clicked. */
  'booster:activate': { id: BoosterId };

  /** A turn was accepted by the model and moves should be decremented. */
  'turn:consumed': undefined;

  /** Score changed, new total. */
  'score:changed': number;
  /** Remaining moves. */
  'moves:changed': number;
  /** Top-level phase transition. */
  'phase:changed': GamePhase;
  /** Number of charges left for each booster. */
  'boosters:changed': { bomb: number; teleport: number; shuffle: number };
  /** Booster waiting for click changed. null means no booster is active. */
  'booster:armed': BoosterId | null;
  /** A super-tile was just spawned at a cell. */
  'super:spawned': { cell: Cell; kind: TileKind };
  /** Field was shuffled. `tries` is how many times we've shuffled so far. */
  'shuffle:performed': { tries: number };
  /** Game ended. */
  'game:won': { score: number };
  'game:lost': { score: number; reason: 'moves' | 'shuffle' };
  /** Game is being restarted. */
  'game:restart': undefined;
}

export type BusListener<K extends keyof BusEvents> = (payload: BusEvents[K]) => void;

/**
 * Small typed pub/sub. Intentionally framework-agnostic: no React, no Pixi.
 * Systems use `emit` to publish, and `on` to subscribe. For events that act
 * as queued commands (`pointer:cell`, `booster:activate`), a system should
 * drain them itself via its own internal buffer.
 */
export class EventBus {
  private readonly listeners = new Map<keyof BusEvents, Set<BusListener<keyof BusEvents>>>();

  on<K extends keyof BusEvents>(event: K, fn: BusListener<K>): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(fn as BusListener<keyof BusEvents>);
    return () => {
      set?.delete(fn as BusListener<keyof BusEvents>);
    };
  }

  emit<K extends keyof BusEvents>(event: K, payload: BusEvents[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const fn of set) {
      (fn as BusListener<K>)(payload);
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
