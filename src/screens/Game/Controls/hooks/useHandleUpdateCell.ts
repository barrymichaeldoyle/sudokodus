import {
  parseCurrentGameState,
  useUpdateCell,
} from '../../../../hooks/useGameStates';
import { useCurrentGameStateQuery } from '../../hooks/useCurrentGameStateQuery';
import { useGameStore } from '../../store';

/**
 * Handles updating a cell in the game state
 * @returns A function that updates a cell in the game state
 */
export function useHandleUpdateCell(): (
  num: number
) => void {
  const { data: gameState } = useCurrentGameStateQuery();
  const selectedCell = useGameStore(
    state => state.selectedCell
  );
  const isNotesMode = useGameStore(
    state => state.isNotesMode
  );
  const updateCell = useUpdateCell();

  return (num: number) => {
    if (!selectedCell || !gameState?.puzzle_string) {
      return;
    }

    // Get the current cell value
    const currentState = parseCurrentGameState(gameState);
    const cellIndex =
      selectedCell.row * 9 + selectedCell.col;
    const currentCell = currentState[cellIndex];

    // If the input number matches the current cell value, set it to 0 (erase)
    const newValue = currentCell.value === num ? 0 : num;

    updateCell.mutate({
      puzzleString: gameState.puzzle_string,
      row: selectedCell.row,
      col: selectedCell.col,
      value: newValue,
      isNotesMode: newValue === 0 ? false : isNotesMode,
    });
  };
}
