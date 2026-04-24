import { MAX_ENTITIES } from '@/game/config';

export const Falling = {
  fromRow: new Float32Array(MAX_ENTITIES),
  fromColumn: new Float32Array(MAX_ENTITIES),
  targetRow: new Float32Array(MAX_ENTITIES),
  targetColumn: new Float32Array(MAX_ENTITIES),
  elapsed: new Float32Array(MAX_ENTITIES),
  duration: new Float32Array(MAX_ENTITIES),
};
