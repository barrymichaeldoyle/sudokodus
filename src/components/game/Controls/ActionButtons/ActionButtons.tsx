import { View } from 'react-native';

import { ActionButton } from './ActionButton';

export function ActionButtons() {
  return (
    <View className="aspect-square p-[10%]">
      <View className="flex-1 flex-row">
        <ActionButton
          icon="arrow.uturn.left"
          label="Undo"
          onPress={() => {}}
        />
        <ActionButton
          icon="eraser"
          label="Erase"
          onPress={() => {}}
        />
      </View>
      <View className="flex-1 flex-row">
        <ActionButton
          icon="questionmark.circle"
          label="Hint"
          onPress={() => {}}
        />
        <ActionButton
          icon="pencil"
          label="Note"
          onPress={() => {}}
        />
      </View>
    </View>
  );
}
