import type { Application } from 'pixi.js';
import type { RenderAdapter } from '../game/renderAdapter';
import type { Cell } from '../game/types';
import type { BlastWorld } from '../game/world';
import { FieldRenderer } from './FieldRenderer';

/**
 * RenderAdapter implemented on top of PixiJS. Owns the FieldRenderer and
 * handles resize / centring. Swapping this with e.g. a Phaser adapter
 * only requires implementing the same RenderAdapter interface.
 */
export class PixiAdapter implements RenderAdapter {
  private field: FieldRenderer | null = null;
  private readonly onResize = (): void => this.layout();

  constructor(private readonly app: Application) {}

  attach(world: BlastWorld): void {
    const { rows, cols, cellSize, cellGap } = world.config;
    this.field = new FieldRenderer(rows, cols, cellSize, cellGap);
    this.field.attach(world.bus);
    this.app.stage.addChild(this.field.root);
    this.layout();
    this.app.renderer.on('resize', this.onResize);
  }

  detach(): void {
    if (this.field) {
      this.app.renderer.off('resize', this.onResize);
      this.field.detach();
      this.field.root.parent?.removeChild(this.field.root);
      this.field.root.destroy({ children: true });
      this.field = null;
    }
  }

  sync(world: BlastWorld): void {
    this.field?.sync(world);
  }

  hitTest(localX: number, localY: number): Cell | null {
    return this.field?.hitTest(localX, localY) ?? null;
  }

  private layout(): void {
    if (!this.field) return;
    const screenW = this.app.screen.width;
    const screenH = this.app.screen.height;
    const padding = 24;
    const fieldW = this.field.pixelWidth;
    const fieldH = this.field.pixelHeight;
    const scale = Math.min((screenW - padding * 2) / fieldW, (screenH - padding * 2) / fieldH);
    this.field.root.scale.set(scale);
    this.field.root.x = (screenW - fieldW * scale) / 2;
    this.field.root.y = (screenH - fieldH * scale) / 2;
  }
}
