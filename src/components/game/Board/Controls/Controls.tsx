import { View } from 'react-native';

import { ActionButton } from './ActionButton';
import { NumberPad } from './NumberPad/NumberPad';

interface ControlsProps {
  onErasePress: () => void;
  onUndoPress: () => void;
  onHintPress: () => void;
  onNotesPress: () => void;
  isNotesMode: boolean;
}

export function Controls({
  onErasePress,
  onUndoPress,
  onHintPress,
  onNotesPress,
  isNotesMode,
}: ControlsProps) {
  return (
    <View className="flex w-full flex-row items-center justify-around px-4">
      {/* Action buttons grid */}
      <View className="flex-1 flex-col gap-4">
        <ActionButton
          icon="eraser"
          onPress={onErasePress}
        />
        <ActionButton
          icon="arrow.uturn.left"
          onPress={onUndoPress}
        />
        <ActionButton
          icon="questionmark.circle"
          onPress={onHintPress}
        />
        <ActionButton
          icon="pencil"
          onPress={onNotesPress}
        />
      </View>

      <NumberPad />
    </View>
  );
}
