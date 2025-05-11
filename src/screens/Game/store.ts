import { create } from 'zustand';

interface GameStore {
  isNotesMode: boolean;
  selectedCell: {
    row: number;
    col: number;
  } | null;
  setSelectedCell: (row: number, col: number) => void;
  toggleNotesMode: () => void;
}

export const useGameStore = create<GameStore>(set => ({
  isNotesMode: false,
  selectedCell: null,
  setSelectedCell: (row, col) =>
    set({ selectedCell: { row, col } }),
  toggleNotesMode: () =>
    set(state => ({ isNotesMode: !state.isNotesMode })),
}));
