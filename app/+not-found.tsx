import { Link, Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen
        options={{ title: 'Oops! Not Found' }}
      />
      <View className="flex-1 bg-[#25292e] justify-center items-center">
        <Link
          href="/"
          className="text-xl text-white underline"
        >
          Go back to Home screen!
        </Link>
      </View>
    </>
  );
}
