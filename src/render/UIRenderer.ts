import { Assets, Container, NineSliceSprite, Sprite, Text, TextStyle } from 'pixi.js';
import type { EventBus } from '@/game/core/EventBus';
import type { BoosterType, WorldData } from '@/game/core/World';

export class UIRenderer {
  readonly root: Container;
  private readonly topPanel: Container;
  private readonly bottomPanel: Container;
  private readonly topBackground: NineSliceSprite;
  private readonly scorePlate: Sprite;

  private readonly movesText: Text;
  private readonly scoreText: Text;
  private readonly scoreLabel: Text;

  private readonly boosterCounts = new Map<BoosterType, Text>();
  private readonly boosterButtons = new Map<BoosterType, Container>();
  private readonly boosterOrder: readonly BoosterType[] = ['shuffle', 'bomb', 'teleport'];

  private bus: EventBus | null = null;

  constructor() {
    this.root = new Container();

    this.topPanel = new Container();
    this.bottomPanel = new Container();

    this.root.addChild(this.topPanel);
    this.root.addChild(this.bottomPanel);

    const topStyleOptions = {
      fontFamily: 'Arial Black',
      fontSize: 24,
      fontWeight: '900',
      fill: '#ffffff',
      align: 'center',
      stroke: { color: '#1d1f57', width: 5 },
      dropShadow: {
        alpha: 0.35,
        angle: Math.PI / 5,
        blur: 1,
        color: '#000000',
        distance: 2,
      },
    } as const;

    this.topBackground = new NineSliceSprite({
      texture: Assets.get('bg_frame_moves'),
      leftWidth: 100,
      rightWidth: 100,
      topHeight: 20,
      bottomHeight: 20,
    });
    this.topBackground.width = 560;
    this.topBackground.height = 240;
    this.topBackground.x = -280;
    this.topBackground.y = -100;
    this.topPanel.addChild(this.topBackground);

    this.scorePlate = new Sprite(Assets.get('slot_frame_moves'));
    this.scorePlate.anchor.set(0.5);
    this.scorePlate.position.set(80, 10);
    this.scorePlate.scale.set(2.8, 0.7);
    this.topPanel.addChild(this.scorePlate);

    const movesBg = new Sprite(Assets.get('bg_moves'));
    movesBg.anchor.set(0.5);
    movesBg.position.set(-140, 10);
    movesBg.scale.set(0.7);
    this.topPanel.addChild(movesBg);

    this.movesText = new Text({
      text: '5',
      style: new TextStyle({ ...topStyleOptions, fontSize: 60 }),
    });
    this.movesText.anchor.set(0.5);
    this.movesText.position.set(-140, 10);
    this.topPanel.addChild(this.movesText);

    this.scoreLabel = new Text({
      text: 'ОЧКИ:',
      style: new TextStyle({ ...topStyleOptions, fontSize: 36 }),
    });
    this.scoreLabel.anchor.set(0.5);
    this.scoreLabel.position.set(80, -20);
    this.topPanel.addChild(this.scoreLabel);

    this.scoreText = new Text({
      text: '0/500',
      style: new TextStyle({ ...topStyleOptions, fontSize: 60 }),
    });
    this.scoreText.anchor.set(0.5);
    this.scoreText.position.set(80, 30);
    this.topPanel.addChild(this.scoreText);

    this.createBoosterButton('shuffle', 0, 0, 'icon_booster_teleport');
    this.createBoosterButton('bomb', 0, 0, 'icon_booster_bomb');
    this.createBoosterButton('teleport', 0, 0, 'icon_booster_teleport');
  }

  private createBoosterButton(id: BoosterType, x: number, y: number, iconName: string): void {
    const container = new Container();
    container.position.set(x, y);
    this.bottomPanel.addChild(container);

    const bg = new Sprite(Assets.get('bg_booster'));
    bg.anchor.set(0.5);
    bg.scale.set(1, 0.6);
    container.addChild(bg);

    const icon = new Sprite(Assets.get(iconName));
    icon.anchor.set(0.5);
    icon.scale.set(0.6);
    icon.y = -30;
    container.addChild(icon);

    const countBg = new Sprite(Assets.get('slot_booster'));
    countBg.anchor.set(0.5);
    countBg.position.set(4, 40);
    countBg.scale.set(1.2, 0.6);
    container.addChild(countBg);

    const countText = new Text({
      text: '0',
      style: {
        fontFamily: 'Arial Black',
        fontSize: 44,
        fontWeight: '900',
        fill: '#ffffff',
        stroke: { color: '#20124d', width: 4 },
      },
    });
    countText.anchor.set(0.5);
    countText.position.set(0, 40);
    container.addChild(countText);

    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.on('pointertap', () => {
      this.bus?.emit('booster:activate', { id });
    });

    this.boosterCounts.set(id, countText);
    this.boosterButtons.set(id, container);
  }

  attach(bus: EventBus): void {
    this.bus = bus;
  }

  sync(world: WorldData): void {
    const { score, movesLeft, boosters, armedBooster, phase } = world.state;
    const { scoreTarget } = world.config;

    this.scoreText.text = `${score}/${scoreTarget}`;
    this.movesText.text = `${movesLeft}`;

    for (const [id, text] of this.boosterCounts) {
      text.text = `${boosters[id] || 0}`;
    }

    const spacing = 170;
    const startX = -((this.boosterOrder.length - 1) * spacing) / 2;
    this.boosterOrder.forEach((id, index) => {
      const button = this.boosterButtons.get(id);
      if (!button) return;
      button.visible = true;
      button.x = startX + index * spacing;
    });

    for (const [id, button] of this.boosterButtons) {
      const isEnabled = boosters[id] > 0 && phase === 'idle';
      button.eventMode = isEnabled ? 'static' : 'none';
      button.cursor = isEnabled ? 'pointer' : 'default';
      button.alpha = isEnabled ? (armedBooster === id ? 1 : 0.95) : 0.45;
      button.scale.set(armedBooster === id && isEnabled ? 1.08 : 1.0);
    }
  }

  layout(
    screenW: number,
    screenH: number,
    _fieldW: number,
    fieldH: number,
    _fieldX: number,
    fieldY: number,
  ): void {
    const uiScale = Math.min(1, screenW / 640);
    this.topPanel.scale.set(uiScale);
    this.bottomPanel.scale.set(uiScale);
    this.topPanel.x = screenW / 2;
    this.topPanel.y = Math.max(18, fieldY - 156 * uiScale);

    this.bottomPanel.x = screenW / 2;
    this.bottomPanel.y = Math.min(screenH - 130 * uiScale, fieldY + fieldH + 150 * uiScale);
  }
}
