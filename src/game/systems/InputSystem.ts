import type { WorldData } from '@/game/core/World';

export class InputSystem {
  static run(world: WorldData, _deltaTime: number): void {
    const { state, intentService } = world;

    if (state.phase === 'animating' || state.phase === 'win' || state.phase === 'lose') {
      const queued = intentService.drain();
      for (const intent of queued) {
        if (intent.type === 'restart') intentService.push(intent);
      }
    }
  }
}
