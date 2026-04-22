import { createWorld } from 'bitecs';
import type { GameConfig } from './config';
import type { EventBus } from './eventBus';
import { IntentQueue } from './intents';
import { FieldModel } from './services/FieldModel';
import type { BoosterId, GamePhase } from './types';

/**
 * Mutable per-world game state. Kept as a single object attached to the
 * bitecs world so every system receives it implicitly via `world.state`.
 *
 * Rationale: bitecs is data-oriented for per-entity arrays, but a Blast game
 * also needs a small amount of global state (score, remaining moves, armed
 * booster). Hiding it in a singleton entity is awkward and encourages
 * indirection; a typed field on the world is cleaner.
 */
export interface GameState {
  phase: GamePhase;

  score: number;
  movesLeft: number;

  boosters: { bomb: number; teleport: number; shuffle: number };
  /** Which booster is waiting for a click (or pair of clicks) on the board. */
  armedBooster: BoosterId | null;

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

export type BlastWorld = ReturnType<typeof createWorld> & {
  state: GameState;
  config: GameConfig;
  bus: EventBus;
  field: FieldModel;
  intents: IntentQueue;
};

export function createGameState(config: GameConfig): GameState {
  return {
    phase: 'idle',
    score: 0,
    movesLeft: config.moves,
    boosters: { ...config.startBoosters },
    armedBooster: null,
    teleportFirstEid: 0,
    shuffleTries: 0,
    turnConsumed: false,
    gen: 0,
  };
}

export function createBlastWorld(config: GameConfig, bus: EventBus): BlastWorld {
  const state = createGameState(config);
  const field = new FieldModel(config.rows, config.cols);
  const intents = new IntentQueue();
  const world = createWorld({ state, config, bus, field, intents }) as BlastWorld;
  return world;
}
