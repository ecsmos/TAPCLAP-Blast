import { addComponent, hasComponent, removeComponent } from 'bitecs';
import { Dying } from '@/game/components/Dying';
import { Falling } from '@/game/components/Falling';
import { GridPosition } from '@/game/components/GridPosition';
import { ScreenPosition } from '@/game/components/ScreenPosition';
import { Tile } from '@/game/components/Tile';
import { Matched, Selected } from '@/game/components/tags';
import type { WorldData } from '@/game/core/World';

export class BoosterSystem {
  private static applyBomb(world: WorldData, row: number, column: number): void {
    const { gridService, config } = world;
    const bombRadius = config.bombBoosterRadius;
    for (let deltaRow = -bombRadius; deltaRow <= bombRadius; deltaRow++) {
      for (let deltaCol = -bombRadius; deltaCol <= bombRadius; deltaCol++) {
        const targetRow = row + deltaRow;
        const targetColumn = column + deltaCol;
        const eid = gridService.getEid(targetRow, targetColumn);
        if (eid === 0) continue;
        if (!hasComponent(world, eid, Dying)) {
          addComponent(world, eid, Matched);
        }
      }
    }
  }

  private static applyTeleport(world: WorldData, row: number, column: number): boolean {
    const { state, gridService } = world;
    const eid = gridService.getEid(row, column);
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

    const firstEid = state.teleportFirstEid;
    const secondEid = eid;

    const firstRow = GridPosition.row[firstEid];
    const firstColumn = GridPosition.column[firstEid];
    const secondRow = GridPosition.row[secondEid];
    const secondColumn = GridPosition.column[secondEid];

    GridPosition.row[firstEid] = secondRow;
    GridPosition.column[firstEid] = secondColumn;
    GridPosition.row[secondEid] = firstRow;
    GridPosition.column[secondEid] = firstColumn;

    gridService.setEid(secondRow, secondColumn, firstEid);
    gridService.setEid(firstRow, firstColumn, secondEid);

    BoosterSystem.setupSwapAnim(world, firstEid, firstRow, firstColumn, secondRow, secondColumn);
    BoosterSystem.setupSwapAnim(world, secondEid, secondRow, secondColumn, firstRow, firstColumn);

    removeComponent(world, firstEid, Selected);
    state.teleportFirstEid = 0;

    void Tile;
    return true;
  }

  private static setupSwapAnim(
    world: WorldData,
    eid: number,
    fromRow: number,
    fromColumn: number,
    toRow: number,
    toColumn: number,
  ): void {
    addComponent(world, eid, Falling);
    Falling.fromRow[eid] = ScreenPosition.row[eid];
    Falling.fromColumn[eid] = ScreenPosition.column[eid];
    Falling.targetRow[eid] = toRow;
    Falling.targetColumn[eid] = toColumn;
    Falling.elapsed[eid] = 0;
    Falling.duration[eid] = world.config.swapDuration;
    void fromRow;
    void fromColumn;
  }

  private static consume(world: WorldData, id: 'bomb' | 'teleport'): void {
    const { state, bus } = world;
    state.boosters[id] = Math.max(0, state.boosters[id] - 1);
    state.armedBooster = null;
    bus.emit('booster:armed', null);
    bus.emit('boosters:changed', { ...state.boosters });
  }

  static run(world: WorldData, _deltaTime: number): void {
    const { state, intentService } = world;
    if (state.armedBooster === null) return;
    if (state.phase !== 'idle') return;

    const queued = intentService.drain();
    let consumed = false;
    for (const intent of queued) {
      if (consumed || intent.type !== 'cell') {
        intentService.push(intent);
        continue;
      }

      if (state.armedBooster === 'bomb') {
        BoosterSystem.applyBomb(world, intent.cell.row, intent.cell.column);
        BoosterSystem.consume(world, 'bomb');
        state.turnConsumed = true;
        state.phase = 'animating';
        consumed = true;
        continue;
      }
      if (state.armedBooster === 'teleport') {
        if (BoosterSystem.applyTeleport(world, intent.cell.row, intent.cell.column)) {
          BoosterSystem.consume(world, 'teleport');
          state.turnConsumed = true;
          state.phase = 'animating';
          consumed = true;
        }
      }
    }
  }
}
