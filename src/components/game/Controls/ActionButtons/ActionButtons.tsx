import { View } from 'react-native';

import { ActionButton } from './ActionButton';

export function ActionButtons() {
  return (
    <View className="aspect-square p-[10%]">
      <View className="flex-1 flex-row">
        <ActionButton
          icon="arrow.uturn.left"
          onPress={() => {}}
        />
        <ActionButton icon="eraser" onPress={() => {}} />
      </View>
      <View className="flex-1 flex-row">
        <ActionButton
          icon="questionmark.circle"
          onPress={() => {}}
        />
        <ActionButton icon="pencil" onPress={() => {}} />
      </View>
    </View>
  );
}
