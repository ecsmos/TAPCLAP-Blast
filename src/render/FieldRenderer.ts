import { hasComponent, query } from 'bitecs';
import { Container, type FederatedPointerEvent, Graphics, Rectangle } from 'pixi.js';
import { GridPos } from '../game/components/GridPos';
import { ScreenPos } from '../game/components/ScreenPos';
import { Tile } from '../game/components/Tile';
import { Selected } from '../game/components/tags';
import type { EventBus } from '../game/eventBus';
import type { Cell, TileColor, TileKind } from '../game/types';
import type { BlastWorld } from '../game/world';
import { TileGraphics } from './TileGraphics';

/**
 * Draws the playfield and routes pointer events into intents. Owns a pool
 * of reusable TileGraphics keyed by entity id.
 */
export class FieldRenderer {
  readonly root: Container;
  private readonly board: Graphics;
  private readonly tilesLayer: Container;
  private readonly sprites = new Map<number, TileGraphics>();
  private bus: EventBus | null = null;

  private readonly rows: number;
  private readonly cols: number;
  private readonly cellSize: number;
  private readonly gap: number;

  constructor(rows: number, cols: number, cellSize: number, gap: number) {
    this.rows = rows;
    this.cols = cols;
    this.cellSize = cellSize;
    this.gap = gap;

    this.root = new Container();
    this.board = new Graphics();
    this.tilesLayer = new Container();
    this.root.addChild(this.board);
    this.root.addChild(this.tilesLayer);

    this.drawBackground();
    this.installHitArea();
  }

  private drawBackground(): void {
    const w = this.cols * this.cellSize + this.gap * 2;
    const h = this.rows * this.cellSize + this.gap * 2;
    this.board.clear();
    this.board.roundRect(0, 0, w, h, 20);
    this.board.fill({ color: 0x1a1330 });
    this.board.roundRect(0, 0, w, h, 20);
    this.board.stroke({ color: 0x3fd3ff, width: 3, alpha: 0.7 });
  }

  private installHitArea(): void {
    const w = this.cols * this.cellSize + this.gap * 2;
    const h = this.rows * this.cellSize + this.gap * 2;
    this.root.eventMode = 'static';
    this.root.hitArea = new Rectangle(0, 0, w, h);
    this.root.cursor = 'pointer';
    this.root.on('pointertap', this.onPointerTap);
  }

  private readonly onPointerTap = (e: FederatedPointerEvent): void => {
    if (!this.bus) return;
    const local = this.tilesLayer.toLocal(e.global);
    const col = Math.floor(local.x / this.cellSize);
    const row = Math.floor(local.y / this.cellSize);
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    this.bus.emit('pointer:cell', { row, col });
  };

  hitTest(localX: number, localY: number): Cell | null {
    const col = Math.floor(localX / this.cellSize);
    const row = Math.floor(localY / this.cellSize);
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
    return { row, col };
  }

  attach(bus: EventBus): void {
    this.bus = bus;
    this.tilesLayer.position.set(this.gap, this.gap);
  }

  detach(): void {
    this.bus = null;
    for (const sprite of this.sprites.values()) sprite.destroy();
    this.sprites.clear();
    this.tilesLayer.removeChildren();
  }

  /**
   * Sync ECS state onto the Pixi display list. Called every frame.
   */
  sync(world: BlastWorld): void {
    const alive = query(world, [Tile, GridPos, ScreenPos]);
    const seen = new Set<number>();

    for (const eid of alive) {
      seen.add(eid);
      let sprite = this.sprites.get(eid);
      if (!sprite) {
        sprite = new TileGraphics(this.cellSize);
        this.sprites.set(eid, sprite);
        this.tilesLayer.addChild(sprite);
      }
      sprite.redraw(Tile.color[eid] as TileColor, Tile.kind[eid] as TileKind);
      sprite.x = ScreenPos.col[eid] * this.cellSize + this.cellSize / 2;
      sprite.y = ScreenPos.row[eid] * this.cellSize + this.cellSize / 2;
      sprite.alpha = ScreenPos.alpha[eid];
      sprite.scale.set(ScreenPos.scale[eid]);
      sprite.setSelected(hasComponent(world, eid, Selected));
    }

    // Reap sprites for entities that no longer exist.
    for (const [eid, sprite] of this.sprites) {
      if (!seen.has(eid)) {
        this.sprites.delete(eid);
        sprite.destroy();
      }
    }
  }

  get pixelWidth(): number {
    return this.cols * this.cellSize + this.gap * 2;
  }

  get pixelHeight(): number {
    return this.rows * this.cellSize + this.gap * 2;
  }
}
