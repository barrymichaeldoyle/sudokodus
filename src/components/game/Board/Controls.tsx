import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface ControlsProps {
  onNumberPress: (number: number) => void;
  onErasePress: () => void;
  onUndoPress: () => void;
  onHintPress: () => void;
  onNotesPress: () => void;
  isNotesMode: boolean;
}

export function Controls({
  onNumberPress,
  onErasePress,
  onUndoPress,
  onHintPress,
  onNotesPress,
  isNotesMode,
}: ControlsProps) {
  return (
    <View className="flex w-full flex-row items-center justify-around">
      {/* Action buttons grid */}
      <View className="aspect-square">
        <View className="flex-1 flex-row gap-4">
          <ActionButton
            icon="delete"
            onPress={onErasePress}
            color="#991B1B"
            bgColor="bg-red-100"
            activeBgColor="bg-red-200"
          />
          <ActionButton
            icon="rotate-ccw"
            onPress={onUndoPress}
            color="#2563eb"
            bgColor="bg-primary-50"
          />
        </View>
        <View className="mt-4 flex-1 flex-row gap-4">
          <ActionButton
            icon="help-circle"
            onPress={onHintPress}
            color="#047857"
            bgColor="bg-emerald-100"
            activeBgColor="bg-emerald-200"
          />
          <ActionButton
            icon="edit-2"
            onPress={onNotesPress}
            isActive={isNotesMode}
          />
        </View>
      </View>

      {/* Number pad grid */}
      <View className="aspect-square max-w-[156px] flex-1">
        <View className="flex-1 flex-row">
          {[1, 2, 3].map(number => (
            <NumberButton
              key={number}
              number={number}
              onPress={onNumberPress}
            />
          ))}
        </View>
        <View className="flex-1 flex-row">
          {[4, 5, 6].map(number => (
            <NumberButton
              key={number}
              number={number}
              onPress={onNumberPress}
            />
          ))}
        </View>
        <View className="flex-1 flex-row">
          {[7, 8, 9].map(number => (
            <NumberButton
              key={number}
              number={number}
              onPress={onNumberPress}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

interface NumberButtonProps {
  number: number;
  onPress: (number: number) => void;
}

function NumberButton({
  number,
  onPress,
}: NumberButtonProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(number)}
      className="flex-1 p-1"
    >
      <View className="aspect-square items-center justify-center rounded-full bg-white active:bg-primary-100">
        <Text className="text-xl font-bold text-primary-900">
          {number}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

interface ActionButtonProps {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  isActive?: boolean;
  color?: string;
  activeColor?: string;
  bgColor?: string;
  activeBgColor?: string;
}

function ActionButton({
  icon,
  onPress,
  isActive = false,
  color = '#2563eb',
  activeColor = '#1a365d',
  bgColor = 'bg-primary-50',
  activeBgColor = 'bg-primary-200',
}: ActionButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={twMerge(
        'h-16 w-16 items-center justify-center rounded-full active:bg-primary-100',
        isActive ? activeBgColor : bgColor
      )}
    >
      <Feather
        name={icon}
        size={24}
        color={isActive ? activeColor : color}
      />
    </TouchableOpacity>
  );
}
