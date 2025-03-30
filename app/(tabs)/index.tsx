import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex flex-1 bg-[#25292e] items-center justify-center">
      <Text className="text-white">Home screen</Text>
      <Link
        href="/about"
        className="text-xl text-white underline"
      >
        Go to About screen
      </Link>
    </View>
  );
}
