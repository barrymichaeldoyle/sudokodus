import Checkbox from 'expo-checkbox';
import { Text, View } from 'react-native';

import { ScreenContainer } from '../src/components/ScreenContainer';
import { useSettingsStore } from '../src/stores/settings';

export default function SettingsScreen() {
  const isHapticFeedbackEnabled = useSettingsStore(
    state => state.isHapticFeedbackEnabled
  );
  const setIsHapticFeedbackEnabled = useSettingsStore(
    state => state.setIsHapticFeedbackEnabled
  );

  return (
    <ScreenContainer>
      <View className="p-4">
        <View className="flex-row items-center justify-between border-b border-gray-300 py-3">
          <Text className="text-base text-black">
            Haptic Feedback
          </Text>
          <Checkbox
            value={isHapticFeedbackEnabled}
            onValueChange={setIsHapticFeedbackEnabled}
            color={
              isHapticFeedbackEnabled
                ? '#81b0ff'
                : undefined
            }
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
