import { type Application, Assets } from 'pixi.js';
import type { Cell, RenderAdapter, WorldData } from '@/game/core/World';
import { GridRenderer } from '@/render/GridRenderer';
import { UIRenderer } from '@/render/UIRenderer';

export class PixiAdapter implements RenderAdapter {
  private grid: GridRenderer | null = null;
  private ui: UIRenderer | null = null;
  private readonly onResize = (): void => this.layout();

  constructor(private readonly app: Application) {}

  private async loadAssets(): Promise<void> {
    const assets = [
      'bg_booster',
      'bg_frame_moves',
      'bg_frame_play',
      'bg_moves',
      'block_blue',
      'block_bomb_max',
      'block_bomb',
      'block_green',
      'block_purpure',
      'block_rakets',
      'block_red',
      'block_rockets_horisontal',
      'block_yellow',
      'icon_booster_bomb',
      'icon_booster_teleport',
      'slot_booster',
      'slot_frame_moves',
    ];

    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    for (const asset of assets) {
      if (!Assets.cache.has(asset)) {
        Assets.add({ alias: asset, src: `${base}/assets/${asset}.png` });
      }
    }

    try {
      await Assets.load(assets);
    } catch (e) {
      console.error('Failed to load assets:', e);
    }
  }

  async attach(world: WorldData): Promise<void> {
    await this.loadAssets();

    const { rows, columns, cellSize, cellGap } = world.config;

    this.grid = new GridRenderer(rows, columns, cellSize, cellGap);
    this.grid.attach(world.bus);

    this.ui = new UIRenderer();
    this.ui.attach(world.bus);

    this.app.stage.addChild(this.grid.root);
    this.app.stage.addChild(this.ui.root);

    this.layout();
    this.app.renderer.on('resize', this.onResize);
  }

  detach(): void {
    if (this.grid) {
      this.app.renderer.off('resize', this.onResize);
      this.grid.detach();
      this.grid.root.parent?.removeChild(this.grid.root);
      this.grid.root.destroy({ children: true });
      this.grid = null;
    }
    if (this.ui) {
      this.ui.root.parent?.removeChild(this.ui.root);
      this.ui.root.destroy({ children: true });
      this.ui = null;
    }
  }

  sync(world: WorldData): void {
    this.grid?.sync(world);
    this.ui?.sync(world);

    this.layout();
  }

  hitTest(localX: number, localY: number): Cell | null {
    return this.grid?.hitTest(localX, localY) ?? null;
  }

  private layout(): void {
    if (!this.grid) return;

    const layout = this.grid.computeFitLayout(this.app.screen.width, this.app.screen.height, 10);
    this.grid.applyLayout(layout);

    this.ui?.layout(
      this.app.screen.width,
      this.app.screen.height,
      layout.width,
      layout.height,
      layout.x,
      layout.y,
    );
  }
}
