import { Assets, Container, Graphics, Sprite } from 'pixi.js';
import { TileType, TileVariant } from '@/game/components/Tile';

const getVariantTexture = (variant: TileVariant): string => {
  switch (variant) {
    case TileVariant.Blue:
      return 'block_blue';
    case TileVariant.Red:
      return 'block_red';
    case TileVariant.Green:
      return 'block_green';
    case TileVariant.Yellow:
      return 'block_yellow';
    case TileVariant.Pink:
      return 'block_purpure';
    default:
      return 'block_blue';
  }
};

const getTypeTexture = (type: TileType): string => {
  switch (type) {
    case TileType.Bomb:
    case TileType.Radial:
      return 'block_bomb';
    case TileType.Striped:
      return 'block_rockets_horisontal';
    case TileType.Wrapped:
      return 'block_rakets';
    case TileType.SuperBomb:
      return 'block_bomb_max';
    default:
      return 'block_blue';
  }
};

export class TileGraphics extends Container {
  private readonly body: Sprite;
  private readonly overlay: Graphics;
  private currentVariant: TileVariant = -1 as TileVariant;
  private currentType: TileType = -1 as TileType;

  constructor(private readonly cellSize: number) {
    super();
    this.body = new Sprite();
    this.body.anchor.set(0.5);
    this.overlay = new Graphics();
    this.addChild(this.body);
    this.addChild(this.overlay);
  }

  setSelected(selected: boolean): void {
    this.overlay.clear();
    if (selected) {
      const size = this.cellSize - 4;
      this.overlay.roundRect(-size / 2, -size / 2, size, size, 10);
      this.overlay.stroke({ color: 0xffffff, width: 3 });
    }
  }

  redraw(variant: TileVariant, type: TileType): void {
    if (this.currentVariant === variant && this.currentType === type) return;
    this.currentVariant = variant;
    this.currentType = type;

    let textureName = '';
    if (type === TileType.Color) {
      textureName = getVariantTexture(variant);
    } else {
      textureName = getTypeTexture(type);
    }

    if (textureName) {
      const tex = Assets.get(textureName);
      if (tex) {
        this.body.texture = tex;
        const targetSize = this.cellSize - 4;
        const baseSize = Math.max(tex.width, tex.height) || 1;
        const scale = targetSize / baseSize;
        this.body.scale.set(scale);
      }
    }
  }
}
