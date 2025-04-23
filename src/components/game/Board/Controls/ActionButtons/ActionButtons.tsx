import { View } from 'react-native';

import { ActionButton } from './ActionButton';

export function ActionButtons() {
  return (
    <View className="flex-1 flex-col items-center gap-4">
      <ActionButton icon="eraser" onPress={() => {}} />
      <ActionButton
        icon="arrow.uturn.left"
        onPress={() => {}}
      />
      <ActionButton
        icon="questionmark.circle"
        onPress={() => {}}
      />
      <ActionButton icon="pencil" onPress={() => {}} />
    </View>
  );
}
