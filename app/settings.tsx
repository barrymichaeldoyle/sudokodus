import { Switch, Text, View } from 'react-native';

import { primary } from '../src/colors';
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
        <View className="flex-row items-center justify-between border-b border-gray-300 bg-white p-3">
          <Text className="text-base text-black">
            Vibration
          </Text>
          <Switch
            value={isHapticFeedbackEnabled}
            onValueChange={setIsHapticFeedbackEnabled}
            trackColor={{
              true: primary[500],
              false: primary[200],
            }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
