import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef } from 'react';
import type { Game } from '@/game';

type GameRef = { current: Game | null };
const ctx = createContext<GameRef>({ current: null });

export const GameProvider = ({ children, gameRef }: { children: ReactNode; gameRef: GameRef }) => {
  const value = useMemo(() => gameRef, [gameRef]);
  return <ctx.Provider value={value}>{children}</ctx.Provider>;
};

export const useGame = (): GameRef => useContext(ctx);

export const useGameRef = (): GameRef => {
  const ref = useRef<Game | null>(null);
  useEffect(() => {}, []);
  return ref;
};
