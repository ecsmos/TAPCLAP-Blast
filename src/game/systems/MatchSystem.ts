import { addComponent, removeComponent } from 'bitecs';
import { GridPos } from '../components/GridPos';
import { Tile } from '../components/Tile';
import { Matched, Selected } from '../components/tags';
import type { System } from '../scheduler';
import { floodFill } from '../services/FloodFill';
import { isSuperKind, SUPER_TILE_KINDS, type TileKind } from '../types';

/**
 * MatchSystem is the heart of the Blast mechanic. It drains cell-tap
 * intents and resolves them into Matched tags for the DestroySystem.
 *
 * Rules:
 *   - A click on an ordinary tile with a group size < 2 is ignored (no turn).
 *   - A click on a super-tile activates its area effect (delegated to
 *     SuperTileSystem via leaving the tile alone here and letting
 *     SuperTileSystem handle it after us).
 *   - A group >= superThreshold spawns a super-tile at the click cell
 *     instead of destroying that one cell.
 */
export const MatchSystem: System = (world) => {
  const { state, intents, field, config, bus } = world;

  // Only process cell taps when no booster is armed. Booster taps are
  // handled by BoosterSystem which runs before us.
  if (state.armedBooster !== null) return;
  if (state.phase !== 'idle') return;

  const queued = intents.drain();
  let consumed = false;
  for (let i = 0; i < queued.length; i++) {
    const intent = queued[i];
    if (consumed) {
      intents.push(intent);
      continue;
    }
    if (intent.type !== 'cell') {
      intents.push(intent);
      continue;
    }

    const { row, col } = intent.cell;
    const eid = field.getEid(row, col);
    if (eid === 0) continue;

    const kind = Tile.kind[eid] as TileKind;

    // Super-tile activation is deferred to SuperTileSystem. We re-queue
    // the intent so that system, which runs right after us, picks it up.
    if (isSuperKind(kind)) {
      intents.push(intent);
      continue;
    }

    const group = floodFill(field, row, col);
    if (group.length < 2) continue;

    if (group.length >= config.superThreshold) {
      // Keep the click cell, convert it into a random super kind.
      const superKind = SUPER_TILE_KINDS[Math.floor(Math.random() * SUPER_TILE_KINDS.length)];
      Tile.kind[eid] = superKind;

      for (const id of group) {
        if (id === eid) continue;
        addComponent(world, id, Matched);
      }

      bus.emit('super:spawned', { cell: { row, col }, kind: superKind });
    } else {
      for (const id of group) {
        addComponent(world, id, Matched);
      }
    }

    // Clear any lingering teleport selection if the player clicked a normal tile.
    if (state.teleportFirstEid !== 0) {
      removeComponent(world, state.teleportFirstEid, Selected);
      state.teleportFirstEid = 0;
    }

    state.turnConsumed = true;
    state.phase = 'animating';
    state.gen++;
    consumed = true;
  }

  // Sanity guard: Matched tiles without GridPos shouldn't exist.
  void GridPos;
};
