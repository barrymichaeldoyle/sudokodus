import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { primary, white } from '../src/colors';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { GAME_TITLE } from '../src/constants';

export default function NotFoundScreen() {
  return (
    <ScreenContainer>
      <Stack.Screen
        options={{
          title: GAME_TITLE,
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: primary['500'],
          },
          headerTintColor: white,
          animation: 'simple_push',
        }}
      />
      <View className="flex-1 flex-col items-center justify-center gap-4">
        <Text className="text-2xl">Oops! Not Found</Text>
        <Link href="/" className="text-xl underline">
          Go back to Home screen!
        </Link>
      </View>
    </ScreenContainer>
  );
}
