import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: 'About',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
