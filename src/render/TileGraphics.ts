import { Container, Graphics } from 'pixi.js';
import { TileColor, TileKind } from '../game/types';
import { TILE_HIGHLIGHT, TILE_PALETTE } from './colors';

/**
 * A single visual tile. Placeholder geometry drawn with Pixi's Graphics so
 * we don't need image assets at this stage. Replace with Sprite-based
 * implementation when PNG atlases land in public/assets/tiles/.
 */
export class TileGraphics extends Container {
  private readonly body: Graphics;
  private readonly overlay: Graphics;
  private currentColor: TileColor = TileColor.Blue;
  private currentKind: TileKind = TileKind.Color;

  constructor(private readonly cellSize: number) {
    super();
    this.body = new Graphics();
    this.overlay = new Graphics();
    this.addChild(this.body);
    this.addChild(this.overlay);
    this.redraw(TileColor.Blue, TileKind.Color);
  }

  setSelected(selected: boolean): void {
    this.overlay.clear();
    if (selected) {
      const size = this.cellSize - 4;
      this.overlay.roundRect(-size / 2, -size / 2, size, size, 10);
      this.overlay.stroke({ color: 0xffffff, width: 3 });
    }
  }

  redraw(color: TileColor, kind: TileKind): void {
    if (this.currentColor === color && this.currentKind === kind) return;
    this.currentColor = color;
    this.currentKind = kind;

    const g = this.body;
    g.clear();
    const size = this.cellSize - 6;
    const half = size / 2;

    if (kind === TileKind.Color) {
      drawColorTile(g, color, size);
    } else if (kind === TileKind.Striped) {
      drawStriped(g, color, size, 'horizontal');
    } else if (kind === TileKind.Wrapped) {
      drawStriped(g, color, size, 'vertical');
    } else if (kind === TileKind.Radial) {
      drawRadial(g, color, size);
    } else if (kind === TileKind.SuperBomb) {
      drawSuperBomb(g, size);
    } else if (kind === TileKind.Bomb) {
      drawBomb(g, size);
    }

    g.position.set(0, 0);
    void half;
  }
}

function drawColorTile(g: Graphics, color: TileColor, size: number): void {
  const half = size / 2;
  const base = TILE_PALETTE[color];
  const hi = TILE_HIGHLIGHT[color];

  g.roundRect(-half, -half, size, size, 10);
  g.fill({ color: base });

  // Soft inner highlight (top-left gradient fake).
  g.roundRect(-half + 3, -half + 3, size - 6, (size - 6) * 0.45, 8);
  g.fill({ color: hi, alpha: 0.45 });

  // Star in the center.
  drawStar(g, 0, 0, size * 0.32, size * 0.15, 0xfff6df);
}

function drawStriped(
  g: Graphics,
  color: TileColor,
  size: number,
  orientation: 'horizontal' | 'vertical',
): void {
  const half = size / 2;
  const base = TILE_PALETTE[color];
  g.roundRect(-half, -half, size, size, 10);
  g.fill({ color: base });

  const stripes = 3;
  for (let i = 0; i < stripes; i++) {
    const t = (i + 0.5) / stripes - 0.5;
    if (orientation === 'horizontal') {
      g.rect(-half + 2, t * size - 3, size - 4, 6);
    } else {
      g.rect(t * size - 3, -half + 2, 6, size - 4);
    }
    g.fill({ color: 0xffffff, alpha: 0.8 });
  }
}

function drawRadial(g: Graphics, color: TileColor, size: number): void {
  const half = size / 2;
  const base = TILE_PALETTE[color];
  g.roundRect(-half, -half, size, size, 10);
  g.fill({ color: base });

  g.circle(0, 0, size * 0.28);
  g.fill({ color: 0xffffff, alpha: 0.85 });
  g.circle(0, 0, size * 0.18);
  g.fill({ color: base });
  g.circle(0, 0, size * 0.08);
  g.fill({ color: 0xffffff });
}

function drawSuperBomb(g: Graphics, size: number): void {
  const half = size / 2;
  g.roundRect(-half, -half, size, size, 10);
  g.fill({ color: 0x1a1a24 });
  g.circle(0, 0, size * 0.36);
  g.fill({ color: 0xff3b3b });
  g.circle(0, 0, size * 0.22);
  g.fill({ color: 0xffd54a });
  g.circle(0, 0, size * 0.1);
  g.fill({ color: 0xffffff });
}

function drawBomb(g: Graphics, size: number): void {
  const half = size / 2;
  g.roundRect(-half, -half, size, size, 10);
  g.fill({ color: 0xff5a52 });

  g.circle(0, 2, size * 0.3);
  g.fill({ color: 0x222 });
  g.circle(-size * 0.12, -size * 0.1, size * 0.08);
  g.fill({ color: 0xffffff, alpha: 0.8 });

  // Fuse
  g.moveTo(size * 0.2, -size * 0.25);
  g.lineTo(size * 0.35, -size * 0.4);
  g.stroke({ color: 0x444, width: 3 });
  g.circle(size * 0.38, -size * 0.42, 3);
  g.fill({ color: 0xffcc00 });
}

function drawStar(
  g: Graphics,
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  color: number,
): void {
  const points: number[] = [];
  const spikes = 5;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / spikes) * i - Math.PI / 2;
    points.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  g.poly(points);
  g.fill({ color });
}
