import { MAX_ENTITIES } from '../types';

/**
 * Core tile data. `color` is meaningful for ordinary tiles (TileKind.Color);
 * for super-tiles the matcher ignores it and the area effect is driven by
 * `kind`.
 */
export const Tile = {
  color: new Uint8Array(MAX_ENTITIES),
  kind: new Uint8Array(MAX_ENTITIES),
};
