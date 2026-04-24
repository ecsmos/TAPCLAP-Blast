import { useRef } from 'react';
import type { Game } from '@/game';
import { EndModal } from '@/ui/EndModal';
import { GameProvider } from '@/ui/GameContext';
import { PixiStage } from '@/ui/PixiStage';

const App = () => {
  const gameRef = useRef<Game | null>(null);

  return (
    <GameProvider gameRef={gameRef}>
      <div className="App">
        <main className="app__stage">
          <PixiStage />
        </main>
        <EndModal />
      </div>
    </GameProvider>
  );
};

export default App;
