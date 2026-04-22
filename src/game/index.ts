import { defaultConfig, type GameConfig } from './config';
import { EventBus } from './eventBus';
import type { Intent } from './intents';
import type { RenderAdapter } from './renderAdapter';
import { Scheduler, type System } from './scheduler';
import { seedField } from './seed';
import { AnimationSystem } from './systems/AnimationSystem';
import { BoosterArmSystem } from './systems/BoosterArmSystem';
import { BoosterSystem } from './systems/BoosterSystem';
import { CascadeSystem } from './systems/CascadeSystem';
import { DestroySystem } from './systems/DestroySystem';
import { InputSystem } from './systems/InputSystem';
import { MatchSystem } from './systems/MatchSystem';
import { RefillSystem } from './systems/RefillSystem';
import { ScoreSystem } from './systems/ScoreSystem';
import { ShuffleSystem } from './systems/ShuffleSystem';
import { SuperTileSystem } from './systems/SuperTileSystem';
import { TurnSystem } from './systems/TurnSystem';
import { WinLoseSystem } from './systems/WinLoseSystem';
import { type BlastWorld, createBlastWorld } from './world';

export { defaultConfig } from './config';
export type { BusEvents } from './eventBus';
export { EventBus } from './eventBus';
export type { Intent } from './intents';
export type { RenderAdapter } from './renderAdapter';
export * from './types';

/**
 * Ordered pipeline. The ordering is load-bearing — see docs/architecture
 * in the plan. In particular:
 *   - InputSystem gates input based on phase.
 *   - BoosterArmSystem runs first so a booster is armed before the tap.
 *   - BoosterSystem consumes cell taps before MatchSystem.
 *   - SuperTileSystem runs after MatchSystem so a tap on an ordinary tile
 *     of a super color still produces a match rather than being swallowed
 *     (MatchSystem re-queues taps that landed on a super-tile).
 *   - DestroySystem → ScoreSystem → TurnSystem must happen in one pass.
 *   - CascadeSystem → RefillSystem produces new falling animations.
 *   - AnimationSystem advances time and flips phase back to idle.
 *   - ShuffleSystem checks for a soft-lock after settling.
 *   - WinLoseSystem is the final authority.
 */
const pipeline: readonly System[] = [
  InputSystem,
  BoosterArmSystem,
  BoosterSystem,
  MatchSystem,
  SuperTileSystem,
  DestroySystem,
  ScoreSystem,
  TurnSystem,
  CascadeSystem,
  RefillSystem,
  AnimationSystem,
  ShuffleSystem,
  WinLoseSystem,
];

export interface GameOptions {
  config?: GameConfig;
  render?: RenderAdapter;
}

/**
 * Top-level orchestrator. Owns the world, scheduler, bus and the render
 * adapter. Completely framework-agnostic: pass a Pixi or Phaser adapter.
 */
export class Game {
  readonly bus: EventBus;
  readonly world: BlastWorld;
  private readonly scheduler: Scheduler;
  private readonly render: RenderAdapter | null;

  constructor(options: GameOptions = {}) {
    const config = options.config ?? defaultConfig;
    this.bus = new EventBus();
    this.world = createBlastWorld(config, this.bus);
    this.scheduler = new Scheduler(pipeline);
    this.render = options.render ?? null;
  }

  start(): void {
    seedField(this.world);
    this.render?.attach(this.world);
    // Push initial state to subscribers so the UI starts in sync.
    this.bus.emit('score:changed', this.world.state.score);
    this.bus.emit('moves:changed', this.world.state.movesLeft);
    this.bus.emit('boosters:changed', { ...this.world.state.boosters });
    this.bus.emit('phase:changed', this.world.state.phase);
  }

  restart(): void {
    // Clean-up: replace world with a fresh one and re-seed.
    const cfg = this.world.config;
    this.render?.detach();
    // bitecs worlds are standalone values; dropping the reference is enough
    // because we allocate typed arrays once at MAX_ENTITIES and reuse them.
    const fresh = createBlastWorld(cfg, this.bus);
    (this as { world: BlastWorld }).world = fresh;
    seedField(this.world);
    this.render?.attach(this.world);

    this.bus.emit('score:changed', this.world.state.score);
    this.bus.emit('moves:changed', this.world.state.movesLeft);
    this.bus.emit('boosters:changed', { ...this.world.state.boosters });
    this.bus.emit('phase:changed', this.world.state.phase);
    this.bus.emit('booster:armed', null);
  }

  pushIntent(intent: Intent): void {
    if (intent.type === 'restart') {
      this.restart();
      return;
    }
    this.world.intents.push(intent);
  }

  tick(dt: number): void {
    this.scheduler.update(this.world, dt);
    this.render?.sync(this.world);
  }

  destroy(): void {
    this.render?.detach();
    this.bus.clear();
  }
}
