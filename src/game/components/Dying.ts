import { MAX_ENTITIES } from '../types';

/**
 * Entity is playing a destruction animation. When elapsed >= duration the
 * AnimationSystem removes the entity from the world.
 */
export const Dying = {
  elapsed: new Float32Array(MAX_ENTITIES),
  duration: new Float32Array(MAX_ENTITIES),
};
