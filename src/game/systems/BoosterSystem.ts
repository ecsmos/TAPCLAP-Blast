import { addComponent, hasComponent, removeComponent } from 'bitecs';
import { Dying } from '../components/Dying';
import { Falling } from '../components/Falling';
import { GridPos } from '../components/GridPos';
import { ScreenPos } from '../components/ScreenPos';
import { Tile } from '../components/Tile';
import { Matched, Selected } from '../components/tags';
import type { System } from '../scheduler';
import type { BlastWorld } from '../world';

/**
 * Applies the currently armed booster's effect on a tapped cell.
 * Must run before MatchSystem so normal click matching doesn't happen when
 * a booster is armed.
 */
export const BoosterSystem: System = (world) => {
  const { state, intents } = world;
  if (state.armedBooster === null) return;
  if (state.phase !== 'idle') return;

  const queued = intents.drain();
  let consumed = false;
  for (const intent of queued) {
    if (consumed || intent.type !== 'cell') {
      intents.push(intent);
      continue;
    }

    if (state.armedBooster === 'bomb') {
      applyBomb(world, intent.cell.row, intent.cell.col);
      consume(world, 'bomb');
      state.turnConsumed = true;
      state.phase = 'animating';
      consumed = true;
      continue;
    }
    if (state.armedBooster === 'teleport') {
      if (applyTeleport(world, intent.cell.row, intent.cell.col)) {
        consume(world, 'teleport');
        state.turnConsumed = true;
        state.phase = 'animating';
        consumed = true;
      }
      // First pick: keep booster armed and wait for a second tap.
    }
  }
};

function applyBomb(world: BlastWorld, row: number, col: number): void {
  const { field, config } = world;
  const r = config.bombBoosterRadius;
  for (let dr = -r; dr <= r; dr++) {
    for (let dc = -r; dc <= r; dc++) {
      const rr = row + dr;
      const cc = col + dc;
      const eid = field.getEid(rr, cc);
      if (eid === 0) continue;
      if (!hasComponent(world, eid, Dying)) {
        addComponent(world, eid, Matched);
      }
    }
  }
}

function applyTeleport(world: BlastWorld, row: number, col: number): boolean {
  const { state, field } = world;
  const eid = field.getEid(row, col);
  if (eid === 0) return false;
  if (hasComponent(world, eid, Dying) || hasComponent(world, eid, Falling)) {
    return false;
  }

  if (state.teleportFirstEid === 0) {
    state.teleportFirstEid = eid;
    addComponent(world, eid, Selected);
    return false;
  }

  if (state.teleportFirstEid === eid) {
    removeComponent(world, eid, Selected);
    state.teleportFirstEid = 0;
    return false;
  }

  const a = state.teleportFirstEid;
  const b = eid;

  // Swap logical positions and visual positions, then set Falling so the
  // AnimationSystem tweens each tile into its new spot.
  const aRow = GridPos.row[a];
  const aCol = GridPos.col[a];
  const bRow = GridPos.row[b];
  const bCol = GridPos.col[b];

  GridPos.row[a] = bRow;
  GridPos.col[a] = bCol;
  GridPos.row[b] = aRow;
  GridPos.col[b] = aCol;

  field.setEid(bRow, bCol, a);
  field.setEid(aRow, aCol, b);

  setupSwapAnim(world, a, aRow, aCol, bRow, bCol);
  setupSwapAnim(world, b, bRow, bCol, aRow, aCol);

  removeComponent(world, a, Selected);
  state.teleportFirstEid = 0;

  // Touch Tile just to silence unused imports.
  void Tile;
  return true;
}

function setupSwapAnim(
  world: BlastWorld,
  eid: number,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): void {
  addComponent(world, eid, Falling);
  Falling.fromRow[eid] = ScreenPos.row[eid];
  Falling.fromCol[eid] = ScreenPos.col[eid];
  Falling.targetRow[eid] = toRow;
  Falling.targetCol[eid] = toCol;
  Falling.elapsed[eid] = 0;
  Falling.duration[eid] = world.config.swapDuration;
  void fromRow;
  void fromCol;
}

function consume(world: BlastWorld, id: 'bomb' | 'teleport'): void {
  const { state, bus } = world;
  state.boosters[id] = Math.max(0, state.boosters[id] - 1);
  state.armedBooster = null;
  bus.emit('booster:armed', null);
  bus.emit('boosters:changed', { ...state.boosters });
}
