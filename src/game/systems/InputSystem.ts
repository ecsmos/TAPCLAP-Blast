import type { System } from '../scheduler';

/**
 * The InputSystem itself is minimal: by the time we run, the renderer has
 * already converted pointer events into typed intents and pushed them onto
 * `world.intents`. Match/Booster/SuperTile systems drain that queue.
 *
 * The system is kept as an explicit step so we have a well-defined slot
 * in the scheduler timeline where "pending input exists" becomes "pending
 * input is being consumed". If we ever need to throttle or reject input
 * (e.g. during `animating` phase), this is the one place to do so.
 */
export const InputSystem: System = (world) => {
  const { state, intents } = world;

  // Reject player input during animation / end phases. We keep restart
  // intents alive so the player can always restart.
  if (state.phase === 'animating' || state.phase === 'win' || state.phase === 'lose') {
    const queued = intents.drain();
    for (const it of queued) {
      if (it.type === 'restart') intents.push(it);
    }
  }
};
