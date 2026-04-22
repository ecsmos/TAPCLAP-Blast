import { MAX_ENTITIES } from '../types';

/**
 * Current visual position of the entity, in cell units relative to the
 * top-left of the playfield. Interpolated by AnimationSystem toward
 * `Falling.targetRow`. Renderer converts this to pixel coordinates.
 */
export const ScreenPos = {
  row: new Float32Array(MAX_ENTITIES),
  col: new Float32Array(MAX_ENTITIES),
  /** Visual transparency [0..1]. Used when tiles are dying. */
  alpha: new Float32Array(MAX_ENTITIES),
  /** Uniform scale applied by the renderer. Used for pop/death animations. */
  scale: new Float32Array(MAX_ENTITIES),
};
