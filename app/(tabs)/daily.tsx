import { Text, View } from 'react-native';
import { usePostHogCapture } from '../../src/hooks/usePostHogCapture';

export default function DailyChallengesScreen() {
  usePostHogCapture('daily_challenges_screen_opened');

  return (
    <View className="flex flex-1 items-center justify-center">
      <Text>Daily Challenges Screen</Text>
    </View>
  );
}
