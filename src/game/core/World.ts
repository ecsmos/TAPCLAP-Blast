import { createWorld } from 'bitecs';
import type { Config } from '@/game/config';
import type { EventBus } from '@/game/core/EventBus';
import { TileFactory } from '@/game/factories/TileFactory';
import { GridService } from '@/game/services/GridService';
import { IntentService } from '@/game/services/IntentService';

export interface Cell {
  row: number;
  column: number;
}

export type BoosterType = 'bomb' | 'teleport' | 'shuffle';

export type Phase = 'idle' | 'resolving' | 'animating' | 'shuffling' | 'win' | 'lose';

export interface State {
  phase: Phase;

  score: number;
  movesLeft: number;

  boosters: { bomb: number; teleport: number; shuffle: number };
  /** Which booster is waiting for a click (or pair of clicks) on the board. */
  armedBooster: BoosterType | null;

  /** For teleport booster: the first picked entity id (0 if none yet). */
  teleportFirstEid: number;

  /** How many times we have auto-shuffled this game. */
  shuffleTries: number;

  /** Did the last player action produce a move that should be counted? */
  turnConsumed: boolean;

  /**
   * Monotonic generation counter. Bumped every time we mutate the grid
   * synchronously so subscribers (e.g. UI store) can throttle updates.
   */
  gen: number;
}

export type WorldData = ReturnType<typeof createWorld> & {
  config: Config;
  state: State;
  bus: EventBus;
  gridService: GridService;
  intentService: IntentService;
  tileFactory: TileFactory;
};

export type System = (world: WorldData, deltaTime: number) => void;

export interface RenderAdapter {
  attach(world: WorldData): void | Promise<void>;
  sync(world: WorldData): void;
  detach(): void;
  hitTest(localX: number, localY: number): Cell | null;
}

export class World {
  constructor(
    private readonly config: Config,
    private readonly bus: EventBus,
  ) {}

  create(): WorldData {
    const state: State = {
      phase: 'idle',
      score: 0,
      movesLeft: this.config.moves,
      boosters: { ...this.config.startBoosters },
      armedBooster: null,
      teleportFirstEid: 0,
      shuffleTries: 0,
      turnConsumed: false,
      gen: 0,
    };

    const gridService = new GridService(this.config.rows, this.config.columns);
    const intentService = new IntentService();
    const tileFactory = new TileFactory();

    return createWorld({
      state,
      config: this.config,
      bus: this.bus,
      gridService,
      intentService,
      tileFactory,
    }) as WorldData;
  }
}
