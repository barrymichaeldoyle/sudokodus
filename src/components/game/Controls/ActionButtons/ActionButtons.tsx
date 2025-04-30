import { View } from 'react-native';

import { useUpdateCell } from '../../../../hooks/useGameStates';
import { useCurrentGameStateQuery } from '../../hooks/useCurrentGameStateQuery';
import { useGameStore } from '../../store';
import { ActionButton } from './ActionButton';

export function ActionButtons() {
  const isNotesMode = useGameStore(
    state => state.isNotesMode
  );
  const toggleNotesMode = useGameStore(
    state => state.toggleNotesMode
  );
  const { data: gameState } = useCurrentGameStateQuery();
  const { selectedCell } = useGameStore();
  const updateCell = useUpdateCell();

  function handleErasePress() {
    if (!selectedCell || !gameState?.puzzle_string) {
      return;
    }

    updateCell.mutate({
      puzzleString: gameState.puzzle_string,
      row: selectedCell.row,
      col: selectedCell.col,
      value: 0,
      isNotesMode,
    });
  }

  return (
    <View className="aspect-square p-[10%]">
      <View className="flex-1 flex-row">
        <ActionButton
          icon="arrow.uturn.left"
          label="Undo"
          onPress={() => console.log('undo')}
        />
        <ActionButton
          icon="eraser"
          label="Erase"
          onPress={handleErasePress}
        />
      </View>
      <View className="flex-1 flex-row">
        <ActionButton
          icon="questionmark.circle"
          label="Hint"
          onPress={() => console.log('hint')}
        />
        <ActionButton
          badge={isNotesMode ? 'on' : 'off'}
          icon="pencil"
          label="Notes"
          onPress={toggleNotesMode}
        />
      </View>
    </View>
  );
}
