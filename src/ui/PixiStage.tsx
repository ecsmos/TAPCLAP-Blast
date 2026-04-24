import { Application, type Ticker } from 'pixi.js';
import { useEffect, useRef, useState } from 'react';
import { Game } from '@/game';
import type { Phase } from '@/game/core/World';
import { PixiAdapter } from '@/render/PixiAdapter';
import { useGame } from '@/ui/GameContext';
import { useGameStore } from '@/ui/gameStore';

export const PixiStage = () => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useGame();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let initialized = false;

    const app = new Application();
    const adapter = new PixiAdapter(app);
    const game = new Game({ render: adapter });
    gameRef.current = game;

    const offScore = game.bus.on('score:changed', (score: number) =>
      useGameStore.getState().setScore(score),
    );
    const offPhase = game.bus.on('phase:changed', (p: Phase) =>
      useGameStore.getState().setPhase(p),
    );
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
      console.log('Initializing Pixi App...');
      await app.init({
        resizeTo: host,
        backgroundColor: 0x93145f,
        backgroundAlpha: 1,
        preference: 'webgl',
        antialias: true,
        resolution: window.devicePixelRatio,
        autoDensity: true,
      });
      console.log('Pixi App initialized');
      initialized = true;
      if (disposed) {
        app.destroy(true, { children: true, texture: true });
        return;
      }
      host.appendChild(app.canvas);
      app.renderer.resize(host.clientWidth || 800, host.clientHeight || 600);

      console.log('Starting game...');
      await game.start();
      console.log('Game started');
      setLoading(false);
      app.ticker.add(tickFn);

      adapter.sync(game.world);
    })();

    return () => {
      disposed = true;
      offScore();
      offPhase();
      offWin();
      offLost();
      app.ticker?.remove(tickFn);
      game.destroy();
      if (initialized) {
        app.destroy(true, { children: true, texture: true });
      }
      gameRef.current = null;
    };
  }, [gameRef]);

  return (
    <div ref={hostRef} className="pixi-stage">
      {loading && <div className="pixi-stage__loading">Загрузка...</div>}
    </div>
  );
};
