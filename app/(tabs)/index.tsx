import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex flex-1 items-center justify-center">
      <Text>Home screen</Text>
      <Link href="/about" className="text-xl underline">
        Go to About screen
      </Link>
    </View>
  );
}
