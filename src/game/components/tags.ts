/**
 * Tag components. bitecs 0.4 treats empty objects as valid tag components.
 * We reuse a single identity per tag to keep queries stable.
 */

/** Marked by match/booster systems as "to be destroyed this frame". */
export const Matched = {};

/** Selected as the first/second pick of the teleport booster. */
export const Selected = {};

/** Freshly spawned tile — used by the renderer for a small entrance tween. */
export const Spawning = {};
