import { MAX_ENTITIES } from '../types';

/** Logical (row, col) position in the field. Authoritative source of truth. */
export const GridPos = {
  row: new Uint8Array(MAX_ENTITIES),
  col: new Uint8Array(MAX_ENTITIES),
};
