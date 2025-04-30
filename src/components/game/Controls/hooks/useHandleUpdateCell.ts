import { useUpdateCell } from '../../../../hooks/useGameStates';
import { useCurrentGameStateQuery } from '../../hooks/useCurrentGameStateQuery';
import { useGameStore } from '../../store';

export function useHandleUpdateCell() {
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

    updateCell.mutate({
      puzzleString: gameState.puzzle_string,
      row: selectedCell.row,
      col: selectedCell.col,
      value: num,
      isNotesMode: num === 0 ? false : isNotesMode,
    });
  };
}
