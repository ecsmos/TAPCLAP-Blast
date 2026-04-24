import type { TileType } from '@/game/components/Tile';
import type { BoosterType, Cell, Phase } from '@/game/core/World';

export interface BusEvents {
  /** Player pressed on a field cell. */
  'pointer:cell': Cell;
  /** Booster icon in the HUD was clicked. */
  'booster:activate': { id: BoosterType };
  /** Score changed, new total. */
  'score:changed': number;
  /** Remaining moves. */
  'moves:changed': number;
  /** Top-level phase transition. */
  'phase:changed': Phase;
  /** Number of charges left for each booster. */
  'boosters:changed': { bomb: number; teleport: number; shuffle: number };
  /** Booster waiting for click changed. null means no booster is active. */
  'booster:armed': BoosterType | null;
  /** A super-tile was just spawned at a cell. */
  'super:spawned': { cell: Cell; type: TileType };
  /** Field was shuffled. `tries` is how many times we've shuffled so far. */
  'shuffle:performed': { tries: number };
  /** Game ended. */
  'game:won': { score: number };
  'game:lost': { score: number; reason: 'moves' | 'shuffle' };
}

export type BusListeners<K extends keyof BusEvents> = (payload: BusEvents[K]) => void;

export class EventBus {
  private readonly listeners = new Map<keyof BusEvents, Set<BusListeners<keyof BusEvents>>>();

  on<K extends keyof BusEvents>(event: K, listener: BusListeners<K>): () => void {
    let set = this.listeners.get(event);

    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as BusListeners<keyof BusEvents>);

    return () => {
      set?.delete(listener as BusListeners<keyof BusEvents>);
    };
  }

  emit<K extends keyof BusEvents>(event: K, payload: BusEvents[K]): void {
    const set = this.listeners.get(event);

    if (!set) return;

    for (const listener of set) {
      (listener as BusListeners<K>)(payload);
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
