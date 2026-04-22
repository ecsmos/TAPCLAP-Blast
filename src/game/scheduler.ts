import type { BlastWorld } from './world';

/**
 * A System is a pure function operating on the world. It receives the
 * delta-time of the current tick and must be deterministic given the world
 * state.
 *
 * This is intentionally the simplest possible shape: no class hierarchy,
 * no lifecycle hooks, no DI container. Each file in systems/ exports one
 * system function and everything composes via the Scheduler below.
 */
export type System = (world: BlastWorld, dt: number) => void;

export class Scheduler {
  constructor(private readonly systems: readonly System[]) {}

  update(world: BlastWorld, dt: number): void {
    for (const sys of this.systems) {
      sys(world, dt);
    }
  }
}
