import { addComponent, query } from 'bitecs';
import { Falling } from '../components/Falling';
import { GridPos } from '../components/GridPos';
import { ScreenPos } from '../components/ScreenPos';
import { Tile } from '../components/Tile';
import type { System } from '../scheduler';
import { hasAnyMove } from '../services/Solvability';
import { isSuperKind, type TileKind } from '../types';
import type { BlastWorld } from '../world';

/**
 * Detects soft-locks — no moves possible — and either shuffles the board
 * automatically (up to `maxShuffleTries` times) or triggers a lose.
 *
 * Also consumes the player-requested `shuffle` booster: as long as a
 * shuffle booster is armed and charges remain, perform a manual shuffle
 * without incrementing the shuffle-try counter (manual shuffles are a
 * different resource).
 */
export const ShuffleSystem: System = (world) => {
  const { state, bus } = world;

  if (state.phase !== 'idle' && state.phase !== 'shuffling') return;

  // Manual shuffle booster.
  if (state.armedBooster === 'shuffle' && state.boosters.shuffle > 0) {
    performShuffle(world);
    state.boosters.shuffle--;
    state.armedBooster = null;
    bus.emit('booster:armed', null);
    bus.emit('boosters:changed', { ...state.boosters });
    state.phase = 'animating';
    return;
  }

  // Automatic shuffle when no moves remain.
  if (hasAnyMove(world.field)) return;

  if (state.shuffleTries >= world.config.maxShuffleTries) {
    state.phase = 'lose';
    bus.emit('phase:changed', state.phase);
    bus.emit('game:lost', { score: state.score, reason: 'shuffle' });
    return;
  }

  performShuffle(world);
  state.shuffleTries++;
  bus.emit('shuffle:performed', { tries: state.shuffleTries });
  state.phase = 'animating';
};

function performShuffle(world: BlastWorld): void {
  const rawEids = query(world, [Tile, GridPos, ScreenPos]);
  if (rawEids.length === 0) return;
  const eids: number[] = Array.from(rawEids);

  // Only shuffle ordinary color tiles; leave super-tiles where they are so
  // their placement isn't nuked by a soft-lock.
  const movable: number[] = eids.filter((e) => !isSuperKind(Tile.kind[e] as TileKind));
  const positions: Array<{ row: number; col: number }> = movable.map((e) => ({
    row: GridPos.row[e],
    col: GridPos.col[e],
  }));

  // Fisher-Yates over positions, then try up to 10 times to land on a
  // solvable layout.
  for (let attempt = 0; attempt < 10; attempt++) {
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = positions[i];
      positions[i] = positions[j];
      positions[j] = tmp;
    }
    // Apply
    for (let i = 0; i < movable.length; i++) {
      const eid = movable[i];
      const { row, col } = positions[i];
      const fromRow = ScreenPos.row[eid];
      const fromCol = ScreenPos.col[eid];
      GridPos.row[eid] = row;
      GridPos.col[eid] = col;

      addComponent(world, eid, Falling);
      Falling.fromRow[eid] = fromRow;
      Falling.fromCol[eid] = fromCol;
      Falling.targetRow[eid] = row;
      Falling.targetCol[eid] = col;
      Falling.elapsed[eid] = 0;
      Falling.duration[eid] = world.config.swapDuration;
    }
    // Refresh field.
    world.field.clear();
    for (const e of eids) {
      world.field.setEid(GridPos.row[e], GridPos.col[e], e);
    }
    if (hasAnyMove(world.field)) return;
  }
}
