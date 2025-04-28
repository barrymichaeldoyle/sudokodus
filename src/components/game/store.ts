import { create } from 'zustand';

interface GameStore {
  selectedCell: {
    row: number;
    col: number;
  } | null;
  setSelectedCell: (row: number, col: number) => void;
}

export const useGameStore = create<GameStore>(set => ({
  selectedCell: null,
  setSelectedCell: (row, col) =>
    set({ selectedCell: { row, col } }),
}));
