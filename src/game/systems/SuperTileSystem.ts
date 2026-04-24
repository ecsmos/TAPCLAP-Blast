import { addComponent, hasComponent } from 'bitecs';
import { Dying } from '@/game/components/Dying';
import { isSuperType, Tile, TileType } from '@/game/components/Tile';
import { Matched } from '@/game/components/tags';
import type { WorldData } from '@/game/core/World';

export class SuperTileSystem {
  private static activate(
    world: WorldData,
    originEid: number,
    row: number,
    column: number,
    type: TileType,
  ): void {
    const { gridService, config } = world;
    const { rows, columns } = config;

    const markCell = (cellRow: number, cellColumn: number): void => {
      const cellEid = gridService.getEid(cellRow, cellColumn);
      if (cellEid === 0) return;
      if (!hasComponent(world, cellEid, Dying)) {
        addComponent(world, cellEid, Matched);
      }
    };

    addComponent(world, originEid, Matched);

    switch (type) {
      case TileType.Striped:
        for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
          markCell(row, columnIndex);
        }
        break;
      case TileType.Wrapped:
        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
          markCell(rowIndex, column);
        }
        break;
      case TileType.Radial: {
        const radius = config.radialSuperRadius;
        for (let deltaRow = -radius; deltaRow <= radius; deltaRow++) {
          for (let deltaCol = -radius; deltaCol <= radius; deltaCol++) {
            if (deltaRow * deltaRow + deltaCol * deltaCol <= radius * radius) {
              markCell(row + deltaRow, column + deltaCol);
            }
          }
        }
        break;
      }
      case TileType.SuperBomb:
        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
          for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
            markCell(rowIndex, columnIndex);
          }
        }
        break;
      default:
        break;
    }
  }

  static run(world: WorldData, _deltaTime: number): void {
    const { state, intentService, gridService } = world;
    if (state.armedBooster !== null) return;
    if (state.phase !== 'idle') return;

    const queued = intentService.drain();
    let consumed = false;
    for (const intent of queued) {
      if (consumed || intent.type !== 'cell') {
        intentService.push(intent);
        continue;
      }
      const eid = gridService.getEid(intent.cell.row, intent.cell.column);
      if (eid === 0) continue;
      const type = Tile.type[eid] as TileType;
      if (!isSuperType(type)) continue;

      SuperTileSystem.activate(world, eid, intent.cell.row, intent.cell.column, type);
      state.turnConsumed = true;
      state.phase = 'animating';
      consumed = true;
    }
  }
}
