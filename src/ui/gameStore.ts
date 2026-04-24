import { create } from 'zustand';
import type { BoosterType, Phase } from '@/game/core/World';

export interface GameUIState {
  score: number;
  target: number;
  movesLeft: number;
  totalMoves: number;
  boosters: { bomb: number; teleport: number; shuffle: number };
  armedBooster: BoosterType | null;
  phase: Phase;

  setScore(score: number): void;
  setMoves(moves: number): void;
  setBoosters(b: { bomb: number; teleport: number; shuffle: number }): void;
  setArmedBooster(id: BoosterType | null): void;
  setPhase(phase: Phase): void;
  resetAll(initial: {
    score: number;
    movesLeft: number;
    target: number;
    totalMoves: number;
    boosters: { bomb: number; teleport: number; shuffle: number };
    phase: Phase;
  }): void;
}

export const useGameStore = create<GameUIState>((set) => ({
  score: 0,
  target: 500,
  movesLeft: 30,
  totalMoves: 30,
  boosters: { bomb: 3, teleport: 3, shuffle: 5 },
  armedBooster: null,
  phase: 'idle',

  setScore: (score) => set({ score }),
  setMoves: (movesLeft) => set({ movesLeft }),
  setBoosters: (boosters) => set({ boosters }),
  setArmedBooster: (armedBooster) => set({ armedBooster }),
  setPhase: (phase) => set({ phase }),
  resetAll: (p) =>
    set({
      score: p.score,
      target: p.target,
      movesLeft: p.movesLeft,
      totalMoves: p.totalMoves,
      boosters: p.boosters,
      phase: p.phase,
      armedBooster: null,
    }),
}));
