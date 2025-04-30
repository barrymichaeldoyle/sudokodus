import { View } from 'react-native';

import { useGameStore } from '../../store';
import { useHandleUpdateCell } from '../hooks/useHandleUpdateCell';
import { ActionButton } from './ActionButton';

export function ActionButtons() {
  const isNotesMode = useGameStore(
    state => state.isNotesMode
  );
  const toggleNotesMode = useGameStore(
    state => state.toggleNotesMode
  );
  const handleUpdate = useHandleUpdateCell();

  function handleErasePress() {
    handleUpdate(0);
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
