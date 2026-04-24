export interface Config {
  /** Logical grid dimensions. */
  readonly rows: number;
  readonly columns: number;
  /** How many distinct variants are in play. */
  readonly variants: number;

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

export const MAX_ENTITIES = 512;

export const defaultConfig: Config = {
  rows: 9,
  columns: 9,
  variants: 5,

  moves: 5,
  scoreTarget: 500,

  superThreshold: 5,

  bombBoosterRadius: 1,
  radialSuperRadius: 2,

  startBoosters: { bomb: 1, teleport: 3, shuffle: 1 },

  maxShuffleTries: 3,

  cellSize: 128,
  cellGap: 2,

  fallDuration: 0.28,
  destroyDuration: 0.2,
  swapDuration: 0.3,
};
