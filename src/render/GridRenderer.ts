import { hasComponent, query } from 'bitecs';
import { Assets, Container, type FederatedPointerEvent, NineSliceSprite, Rectangle } from 'pixi.js';
import { GridPosition } from '@/game/components/GridPosition';
import { ScreenPosition } from '@/game/components/ScreenPosition';
import { Tile, type TileType, type TileVariant } from '@/game/components/Tile';
import { Selected } from '@/game/components/tags';
import type { EventBus } from '@/game/core/EventBus';
import type { Cell, WorldData } from '@/game/core/World';
import { TileGraphics } from '@/render/TileGraphics';

export class GridRenderer {
  private static readonly TILE_AREA_SCALE = 0.925;
  private static readonly VISUAL_GAP_SCALE = 1;

  readonly root: Container;
  private readonly background: NineSliceSprite;
  private readonly tilesLayer: Container;
  private readonly sprites = new Map<number, TileGraphics>();
  private bus: EventBus | null = null;

  private readonly rows: number;
  private readonly columns: number;
  private readonly cellSize: number;
  private readonly gap: number;
  private readonly visualGap: number;
  private readonly tileScale: number;
  private readonly tileInsetX: number;
  private readonly tileInsetY: number;

  constructor(rows: number, columns: number, cellSize: number, gap: number) {
    this.rows = rows;
    this.columns = columns;
    this.cellSize = cellSize;
    this.gap = gap;
    this.visualGap = this.gap * GridRenderer.VISUAL_GAP_SCALE;
    this.tileScale = GridRenderer.TILE_AREA_SCALE;

    const rawGridWidth = this.columns * this.cellSize;
    const rawGridHeight = this.rows * this.cellSize;
    this.tileInsetX = (rawGridWidth * (1 - this.tileScale)) / 2;
    this.tileInsetY = (rawGridHeight * (1 - this.tileScale)) / 2;

    this.root = new Container();
    this.background = new NineSliceSprite({
      texture: Assets.get('bg_frame_play'),
      leftWidth: 100,
      rightWidth: 100,
      topHeight: 100,
      bottomHeight: 100,
    });
    this.tilesLayer = new Container();
    this.root.addChild(this.background);
    this.root.addChild(this.tilesLayer);

    this.updateBackgroundSize();
    this.installHitArea();
  }

  private updateBackgroundSize(): void {
    const w = this.columns * this.cellSize + this.visualGap;
    const h = this.rows * this.cellSize + this.visualGap;
    this.background.width = w;
    this.background.height = h;
  }

  private installHitArea(): void {
    const w = this.columns * this.cellSize + this.visualGap;
    const h = this.rows * this.cellSize + this.visualGap;
    this.root.eventMode = 'static';
    this.root.hitArea = new Rectangle(0, 0, w, h);
    this.root.cursor = 'pointer';
    this.root.on('pointertap', this.onPointerTap);
  }

  private readonly onPointerTap = (e: FederatedPointerEvent): void => {
    if (!this.bus) return;
    const local = this.tilesLayer.toLocal(e.global);
    const column = Math.floor(local.x / this.cellSize);
    const row = Math.floor(local.y / this.cellSize);
    if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) return;
    this.bus.emit('pointer:cell', { row, column });
  };

  hitTest(localX: number, localY: number): Cell | null {
    const gridX = (localX - this.visualGap - this.tileInsetX) / this.tileScale;
    const gridY = (localY - this.visualGap - this.tileInsetY) / this.tileScale;
    const column = Math.floor(gridX / this.cellSize);
    const row = Math.floor(gridY / this.cellSize);
    if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) return null;
    return { row, column };
  }

  attach(bus: EventBus): void {
    this.bus = bus;
    this.tilesLayer.position.set(
      this.visualGap + this.tileInsetX,
      this.visualGap + this.tileInsetY,
    );
    this.tilesLayer.scale.set(this.tileScale);
  }

  detach(): void {
    this.bus = null;
    for (const sprite of this.sprites.values()) sprite.destroy();
    this.sprites.clear();
    this.tilesLayer.removeChildren();
  }

  sync(world: WorldData): void {
    const alive = query(world, [Tile, GridPosition, ScreenPosition]);
    const seen = new Set<number>();
    for (const eid of alive) {
      seen.add(eid);
      let sprite = this.sprites.get(eid);
      if (!sprite) {
        sprite = new TileGraphics(this.cellSize);
        this.sprites.set(eid, sprite);
        this.tilesLayer.addChild(sprite);
      }
      sprite.redraw(Tile.variant[eid] as TileVariant, Tile.type[eid] as TileType);
      sprite.x = ScreenPosition.column[eid] * this.cellSize + this.cellSize / 2;
      sprite.y = ScreenPosition.row[eid] * this.cellSize + this.cellSize / 2;
      sprite.alpha = ScreenPosition.alpha[eid];
      sprite.scale.set(ScreenPosition.scale[eid]);
      sprite.setSelected(hasComponent(world, eid, Selected));
    }
    for (const [eid, sprite] of this.sprites) {
      if (!seen.has(eid)) {
        this.sprites.delete(eid);
        sprite.destroy();
      }
    }
  }

  get pixelWidth(): number {
    return this.columns * this.cellSize + this.visualGap * 2;
  }

  get pixelHeight(): number {
    return this.rows * this.cellSize + this.visualGap * 2;
  }

  computeFitLayout(
    viewportWidth: number,
    viewportHeight: number,
    padding: number,
  ): { scale: number; x: number; y: number; width: number; height: number } {
    const width = this.pixelWidth;
    const height = this.pixelHeight;
    const scale = Math.max(
      0.1,
      Math.min((viewportWidth - padding * 2) / width, (viewportHeight - padding * 2) / height),
    );

    return {
      scale,
      x: (viewportWidth - width * scale) / 2,
      y: (viewportHeight - height * scale) / 2,
      width: width * scale,
      height: height * scale,
    };
  }

  applyLayout(layout: { scale: number; x: number; y: number }): void {
    this.root.scale.set(layout.scale);
    this.root.x = layout.x;
    this.root.y = layout.y;
    this.root.visible = true;
    this.root.alpha = 1;
  }
}
