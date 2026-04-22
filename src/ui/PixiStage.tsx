import { Application, type Ticker } from 'pixi.js';
import { useEffect, useRef } from 'react';
import { Game } from '../game';
import { PixiAdapter } from '../render/PixiAdapter';
import { useGame } from './GameContext';
import { useGameStore } from './gameStore';

/**
 * Mounts a Pixi Application into a div and wires it up to a Game instance.
 * Also subscribes to the EventBus so the Zustand store mirrors the
 * engine's state for React components.
 */
export function PixiStage() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useGame();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;

    const app = new Application();
    const adapter = new PixiAdapter(app);
    const game = new Game({ render: adapter });
    gameRef.current = game;

    const offScore = game.bus.on('score:changed', (v) => useGameStore.getState().setScore(v));
    const offMoves = game.bus.on('moves:changed', (v) => useGameStore.getState().setMoves(v));
    const offBoost = game.bus.on('boosters:changed', (b) => useGameStore.getState().setBoosters(b));
    const offArm = game.bus.on('booster:armed', (id) =>
      useGameStore.getState().setArmedBooster(id),
    );
    const offPhase = game.bus.on('phase:changed', (p) => useGameStore.getState().setPhase(p));
    const offWin = game.bus.on('game:won', () => useGameStore.getState().setPhase('win'));
    const offLost = game.bus.on('game:lost', () => useGameStore.getState().setPhase('lose'));

    useGameStore.getState().resetAll({
      score: 0,
      target: game.world.config.scoreTarget,
      movesLeft: game.world.config.moves,
      totalMoves: game.world.config.moves,
      boosters: { ...game.world.config.startBoosters },
      phase: 'idle',
    });

    const tickFn = (ticker: Ticker): void => {
      game.tick(ticker.deltaMS / 1000);
    };

    (async () => {
      await app.init({
        resizeTo: host,
        backgroundAlpha: 0,
        preference: 'webgl',
        antialias: true,
        resolution: window.devicePixelRatio,
        autoDensity: true,
      });
      if (disposed) {
        app.destroy(true);
        return;
      }
      host.appendChild(app.canvas);
      game.start();
      app.ticker.add(tickFn);
    })();

    return () => {
      disposed = true;
      offScore();
      offMoves();
      offBoost();
      offArm();
      offPhase();
      offWin();
      offLost();
      app.ticker?.remove(tickFn);
      game.destroy();
      app.destroy(true, { children: true, texture: true });
      gameRef.current = null;
    };
  }, [gameRef]);

  return <div ref={hostRef} className="pixi-stage" />;
}
