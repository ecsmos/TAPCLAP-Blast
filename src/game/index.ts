import { bootstrap } from '@/game/bootstrap';
import { type Config, defaultConfig } from '@/game/config';
import { EventBus } from '@/game/core/EventBus';
import {
  type BoosterType,
  type Cell,
  type RenderAdapter,
  type System,
  World,
  type WorldData,
} from '@/game/core/World';
import type { Intent } from '@/game/services/IntentService';
import { AnimationSystem } from '@/game/systems/AnimationSystem';
import { BoosterArmSystem } from '@/game/systems/BoosterArmSystem';
import { BoosterSystem } from '@/game/systems/BoosterSystem';
import { CascadeSystem } from '@/game/systems/CascadeSystem';
import { DestroySystem } from '@/game/systems/DestroySystem';
import { InputSystem } from '@/game/systems/InputSystem';
import { MatchSystem } from '@/game/systems/MatchSystem';
import { RefillSystem } from '@/game/systems/RefillSystem';
import { ScoreSystem } from '@/game/systems/ScoreSystem';
import { ShuffleSystem } from '@/game/systems/ShuffleSystem';
import { SuperTileSystem } from '@/game/systems/SuperTileSystem';
import { TurnSystem } from '@/game/systems/TurnSystem';
import { WinLoseSystem } from '@/game/systems/WinLoseSystem';

export { defaultConfig } from '@/game/config';
export type { BusEvents } from '@/game/core/EventBus';
export { EventBus } from '@/game/core/EventBus';
export type { RenderAdapter } from '@/game/core/World';
export type { Intent } from '@/game/services/IntentService';

const pipeline: readonly System[] = [
  (world, deltaTime) => InputSystem.run(world, deltaTime),
  (world, deltaTime) => BoosterArmSystem.run(world, deltaTime),
  (world, deltaTime) => BoosterSystem.run(world, deltaTime),
  (world, deltaTime) => MatchSystem.run(world, deltaTime),
  (world, deltaTime) => SuperTileSystem.run(world, deltaTime),
  (world, deltaTime) => DestroySystem.run(world, deltaTime),
  (world, deltaTime) => ScoreSystem.run(world, deltaTime),
  (world, deltaTime) => TurnSystem.run(world, deltaTime),
  (world, deltaTime) => CascadeSystem.run(world, deltaTime),
  (world, deltaTime) => RefillSystem.run(world, deltaTime),
  (world, deltaTime) => AnimationSystem.run(world, deltaTime),
  (world, deltaTime) => ShuffleSystem.run(world, deltaTime),
  (world, deltaTime) => WinLoseSystem.run(world, deltaTime),
];

export interface Options {
  config?: Config;
  render?: RenderAdapter;
}

export class Game {
  readonly bus: EventBus;
  readonly world: WorldData;
  private readonly render: RenderAdapter | null;

  constructor(options: Options = {}) {
    const config = options.config ?? defaultConfig;
    this.bus = new EventBus();
    this.world = new World(config, this.bus).create();
    this.render = options.render ?? null;

    this.bus.on('pointer:cell', (cell: Cell) => {
      this.pushIntent({ type: 'cell', cell });
    });
    this.bus.on('booster:activate', ({ id }: { id: BoosterType }) => {
      this.pushIntent({ type: 'booster', id });
    });
  }

  async start(): Promise<void> {
    bootstrap(this.world);
    await this.render?.attach(this.world);

    this.bus.emit('score:changed', this.world.state.score);
    this.bus.emit('moves:changed', this.world.state.movesLeft);
    this.bus.emit('boosters:changed', { ...this.world.state.boosters });
    this.bus.emit('phase:changed', this.world.state.phase);
  }

  async restart(): Promise<void> {
    const config = this.world.config;
    this.render?.detach();

    (this as { world: WorldData }).world = new World(config, this.bus).create();
    bootstrap(this.world);
    await this.render?.attach(this.world);

    this.bus.emit('score:changed', this.world.state.score);
    this.bus.emit('moves:changed', this.world.state.movesLeft);
    this.bus.emit('boosters:changed', { ...this.world.state.boosters });
    this.bus.emit('phase:changed', this.world.state.phase);
    this.bus.emit('booster:armed', null);
  }

  pushIntent(intent: Intent): void {
    if (intent.type === 'restart') {
      void this.restart();
      return;
    }
    this.world.intentService.push(intent);
  }

  tick(deltaTime: number): void {
    for (const system of pipeline) system(this.world, deltaTime);
    this.render?.sync(this.world);
  }

  destroy(): void {
    this.render?.detach();
    this.bus.clear();
  }
}
