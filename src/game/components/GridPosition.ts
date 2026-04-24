import { MAX_ENTITIES } from '@/game/config';

export const GridPosition = {
  row: new Uint8Array(MAX_ENTITIES),
  column: new Uint8Array(MAX_ENTITIES),
};
