import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'SudokoduS',
          headerBackTitle: 'Back',
        }}
      />
      <View className="flex-1 flex-col items-center justify-center gap-4">
        <Text className="text-2xl">Oops! Not Found</Text>
        <Link href="/" className="text-xl underline">
          Go back to Home screen!
        </Link>
      </View>
    </>
  );
}
