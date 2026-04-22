import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef } from 'react';
import type { Game } from '../game';

/**
 * Provides the Game instance to React components so HUD buttons can push
 * intents (e.g. booster activation, restart) without the UI importing the
 * engine directly.
 */
type GameRef = { current: Game | null };
const ctx = createContext<GameRef>({ current: null });

export function GameProvider({ children, gameRef }: { children: ReactNode; gameRef: GameRef }) {
  const value = useMemo(() => gameRef, [gameRef]);
  return <ctx.Provider value={value}>{children}</ctx.Provider>;
}

export function useGame(): GameRef {
  return useContext(ctx);
}

/** Creates a stable ref that outlives re-renders. */
export function useGameRef(): GameRef {
  const ref = useRef<Game | null>(null);
  useEffect(() => {
    // noop — lifetime is managed by the PixiStage effect.
  }, []);
  return ref;
}
