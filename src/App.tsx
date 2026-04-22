import { useRef } from 'react';
import type { Game } from './game';
import { BoosterBar } from './ui/BoosterBar';
import { EndModal } from './ui/EndModal';
import { GameProvider } from './ui/GameContext';
import { PixiStage } from './ui/PixiStage';
import { ScorePanel } from './ui/ScorePanel';

/**
 * Root layout. React owns the HUD, background and modals; the central
 * game stage is rendered by Pixi inside a plain div.
 */
export default function App() {
  const gameRef = useRef<Game | null>(null);

  return (
    <GameProvider gameRef={gameRef}>
      <div className="app">
        <div className="app__bg" aria-hidden="true" />
        <ScorePanel />
        <main className="app__stage">
          <PixiStage />
        </main>
        <BoosterBar />
        <EndModal />
      </div>
    </GameProvider>
  );
}
