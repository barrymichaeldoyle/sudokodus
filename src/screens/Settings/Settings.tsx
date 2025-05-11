import { View } from 'react-native';

import { ScreenContainer } from '../../components/ScreenContainer';
import { SettingsItem } from './SettingsItem';
import { useSettingsStore } from './store';

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
        <View className="flex flex-col rounded-xl bg-white">
          <SettingsItem
            value={isHapticFeedbackEnabled}
            onValueChange={setIsHapticFeedbackEnabled}
            title="Vibration"
            iosIconName="hand.tap"
            isLastItem
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
