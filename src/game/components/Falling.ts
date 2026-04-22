import { MAX_ENTITIES } from '../types';

/**
 * Tile is animating toward a new (row, col). While this component is
 * present, AnimationSystem owns the visual position. When the visual
 * position matches the target the component is removed by AnimationSystem
 * and the entity becomes interactable again.
 */
export const Falling = {
  fromRow: new Float32Array(MAX_ENTITIES),
  fromCol: new Float32Array(MAX_ENTITIES),
  targetRow: new Float32Array(MAX_ENTITIES),
  targetCol: new Float32Array(MAX_ENTITIES),
  elapsed: new Float32Array(MAX_ENTITIES),
  duration: new Float32Array(MAX_ENTITIES),
};
