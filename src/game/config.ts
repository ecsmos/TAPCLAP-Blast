/**
 * Game balance. All tunable numbers live here so designers can tweak the
 * game without touching any logic.
 */
export interface GameConfig {
  /** Logical grid dimensions. */
  readonly rows: number;
  readonly cols: number;
  /** How many distinct colors are in play. */
  readonly colors: number;

  /** Victory / failure budget. */
  readonly moves: number;
  readonly scoreTarget: number;

  /**
   * Minimum size of a matched group that spawns a super-tile at the click
   * cell. Groups smaller than this burn normally.
   */
  readonly superThreshold: number;

  /** Radius (in cells) of the bomb booster burst. R=1 means a 3x3 area. */
  readonly bombBoosterRadius: number;
  /** Radius of the Radial super-tile burst. */
  readonly radialSuperRadius: number;

  /** Starting booster charges. */
  readonly startBoosters: { bomb: number; teleport: number; shuffle: number };

  /** Automatic shuffles allowed before we declare a lose. */
  readonly maxShuffleTries: number;

  /** Visual cell size in pixels (logical, scaled by renderer). */
  readonly cellSize: number;
  readonly cellGap: number;

  /** Animation durations (seconds). */
  readonly fallDuration: number;
  readonly destroyDuration: number;
  readonly swapDuration: number;
}

export const defaultConfig: GameConfig = {
  rows: 9,
  cols: 9,
  colors: 5,

  moves: 30,
  scoreTarget: 500,

  superThreshold: 5,

  bombBoosterRadius: 1,
  radialSuperRadius: 2,

  startBoosters: { bomb: 3, teleport: 3, shuffle: 5 },

  maxShuffleTries: 3,

  cellSize: 64,
  cellGap: 2,

  fallDuration: 0.28,
  destroyDuration: 0.2,
  swapDuration: 0.3,
};

/**
 * Scoring formula, isolated for easy tweaking. Returns score for burning a
 * group of `n` tiles.
 */
export function scoreForGroup(n: number): number {
  if (n < 2) return 0;
  return 10 * n + 5 * (n - 2) ** 2;
}
