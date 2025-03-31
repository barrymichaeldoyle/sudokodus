import { Link, Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Oops! Not Found',
          headerBackTitle: 'Back',
        }}
      />
      <View className="flex-1 items-center justify-center">
        <Link href="/" className="text-xl underline">
          Go back to Home screen!
        </Link>
      </View>
    </>
  );
}
