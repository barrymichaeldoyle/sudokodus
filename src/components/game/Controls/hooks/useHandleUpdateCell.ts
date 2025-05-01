import { useUpdateCell } from '../../../../hooks/useGameStates';
import { useCurrentGameStateQuery } from '../../hooks/useCurrentGameStateQuery';
import { useGameStore } from '../../store';

/**
 * Handles updating a cell in the game state
 * @returns A function that updates a cell in the game state
 */
export function useHandleUpdateCell(): (
  num: number,
  isNotesMode?: boolean
) => void {
  const { data: gameState } = useCurrentGameStateQuery();
  const selectedCell = useGameStore(
    state => state.selectedCell
  );
  const isNotesMode = useGameStore(
    state => state.isNotesMode
  );
  const updateCell = useUpdateCell();

  return (num: number, isNotesMode = false) => {
    if (!selectedCell || !gameState?.puzzle_string) {
      return;
    }

    updateCell.mutate({
      puzzleString: gameState.puzzle_string,
      row: selectedCell.row,
      col: selectedCell.col,
      value: num,
      isNotesMode: num === 0 ? false : isNotesMode,
    });
  };
}
