import { MAX_ENTITIES } from '@/game/config';

export const ScreenPosition = {
  row: new Float32Array(MAX_ENTITIES),
  column: new Float32Array(MAX_ENTITIES),
  alpha: new Float32Array(MAX_ENTITIES),
  scale: new Float32Array(MAX_ENTITIES),
};
