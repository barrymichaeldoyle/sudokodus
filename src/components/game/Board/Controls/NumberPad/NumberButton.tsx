import { Text, TouchableOpacity, View } from 'react-native';

interface NumberButtonProps {
  number: number;
}

export function NumberButton({
  number,
}: NumberButtonProps) {
  function handlePress() {
    console.log('number', number);
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
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
