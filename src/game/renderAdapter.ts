import type { Cell } from './types';
import type { BlastWorld } from './world';

/**
 * Contract that a concrete renderer (Pixi, Phaser, Canvas2D, ...) must
 * satisfy. Intentionally narrow: only attach/detach and a per-frame sync.
 *
 * Input from the renderer (e.g. pointer clicks on the field) is delivered
 * via `world.bus.emit('pointer:cell', ...)`. The renderer is expected to
 * grab a reference to `world.bus` during `attach`.
 */
export interface RenderAdapter {
  attach(world: BlastWorld): void;
  /**
   * Per-frame render. Receives the authoritative world and should reflect
   * ECS state (ScreenPos, Dying, etc.) into its own draw layer.
   */
  sync(world: BlastWorld): void;
  detach(): void;
  /**
   * Convert a pointer event in canvas local coordinates into a grid cell.
   * Returns null if the pointer is outside the field. The renderer owns
   * this because only it knows the field's on-screen transform.
   */
  hitTest(localX: number, localY: number): Cell | null;
}
