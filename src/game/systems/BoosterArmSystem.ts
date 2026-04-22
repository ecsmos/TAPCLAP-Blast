import { query, removeComponent } from 'bitecs';
import { Selected } from '../components/tags';
import type { System } from '../scheduler';
import type { BlastWorld } from '../world';

/**
 * Handles `booster` intents: arming, disarming (same button twice) and
 * clamping against insufficient charges.
 *
 * The actual effect on the field happens in BoosterSystem (for bomb /
 * teleport cell-tap) or ShuffleSystem (for the shuffle booster).
 */
export const BoosterArmSystem: System = (world) => {
  const { state, intents, bus } = world;
  const queued = intents.drain();

  for (const intent of queued) {
    if (intent.type !== 'booster') {
      intents.push(intent);
      continue;
    }
    if (state.phase !== 'idle') continue;

    const id = intent.id;
    if (state.boosters[id] <= 0) continue;

    if (state.armedBooster === id) {
      state.armedBooster = null;
      bus.emit('booster:armed', null);
      clearSelection(world);
      continue;
    }

    state.armedBooster = id;
    state.teleportFirstEid = 0;
    clearSelection(world);
    bus.emit('booster:armed', id);
  }
};

function clearSelection(world: BlastWorld): void {
  const sel = query(world, [Selected]);
  for (const eid of sel) removeComponent(world, eid, Selected);
}
