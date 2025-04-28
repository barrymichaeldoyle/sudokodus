import { View } from 'react-native';

import { useState } from 'react';
import { ActionButton } from './ActionButton';

export function ActionButtons() {
  const [isNotesOn, setIsNotesOn] = useState(false);

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
          onPress={() => console.log('erase')}
        />
      </View>
      <View className="flex-1 flex-row">
        <ActionButton
          icon="questionmark.circle"
          label="Hint"
          onPress={() => console.log('hint')}
        />
        <ActionButton
          badge={isNotesOn ? 'on' : 'off'}
          icon="pencil"
          label="Notes"
          onPress={() => setIsNotesOn(prev => !prev)}
        />
      </View>
    </View>
  );
}
