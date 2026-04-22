import { addComponent, hasComponent } from 'bitecs';
import { Dying } from '../components/Dying';
import { Tile } from '../components/Tile';
import { Matched } from '../components/tags';
import type { System } from '../scheduler';
import { isSuperKind, TileKind } from '../types';
import type { BlastWorld } from '../world';

/**
 * Activates super-tiles when the player clicks one. Runs after
 * MatchSystem / BoosterSystem so their cell-tap intents get priority;
 * anything not consumed by them flows through here.
 */
export const SuperTileSystem: System = (world) => {
  const { state, intents, field } = world;
  if (state.armedBooster !== null) return;
  if (state.phase !== 'idle') return;

  const queued = intents.drain();
  let consumed = false;
  for (const intent of queued) {
    if (consumed || intent.type !== 'cell') {
      intents.push(intent);
      continue;
    }
    const eid = field.getEid(intent.cell.row, intent.cell.col);
    if (eid === 0) continue;
    const kind = Tile.kind[eid] as TileKind;
    if (!isSuperKind(kind)) continue;

    activate(world, eid, intent.cell.row, intent.cell.col, kind);
    state.turnConsumed = true;
    state.phase = 'animating';
    consumed = true;
  }
};

function activate(
  world: BlastWorld,
  originEid: number,
  row: number,
  col: number,
  kind: TileKind,
): void {
  const { field, config } = world;
  const { rows, cols } = config;

  const markCell = (r: number, c: number): void => {
    const e = field.getEid(r, c);
    if (e === 0) return;
    if (!hasComponent(world, e, Dying)) {
      addComponent(world, e, Matched);
    }
  };

  // The super-tile itself is always consumed.
  addComponent(world, originEid, Matched);

  switch (kind) {
    case TileKind.Striped:
      for (let c = 0; c < cols; c++) markCell(row, c);
      break;
    case TileKind.Wrapped:
      for (let r = 0; r < rows; r++) markCell(r, col);
      break;
    case TileKind.Radial: {
      const R = config.radialSuperRadius;
      for (let dr = -R; dr <= R; dr++) {
        for (let dc = -R; dc <= R; dc++) {
          if (dr * dr + dc * dc <= R * R) markCell(row + dr, col + dc);
        }
      }
      break;
    }
    case TileKind.SuperBomb:
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) markCell(r, c);
      }
      break;
    default:
      break;
  }
}
