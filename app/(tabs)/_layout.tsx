import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { primary, white } from '../../src/colors';
import { renderTabIcon } from '../../src/components/ui/TabIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          ...Platform.select({ web: { height: 60 } }),
          backgroundColor: primary['500'],
        },
        tabBarActiveTintColor: white,
        tabBarInactiveTintColor: `${white}d9`, // hex with 85% opacity
        headerStyle: { backgroundColor: primary['500'] },
        headerTintColor: white,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: renderTabIcon({
            ios: {
              name: 'house',
              focusedName: 'house.fill',
            },
            web: { name: 'home' },
          }),
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: 'Active Games',
          tabBarIcon: renderTabIcon({
            ios: {
              name: 'gamecontroller',
              focusedName: 'gamecontroller.fill',
            },
            web: { name: 'game-controller' },
          }),
        }}
      />
      <Tabs.Screen
        name="daily"
        options={{
          title: 'Daily Challenges',
          tabBarIcon: renderTabIcon({
            ios: {
              name: 'flame',
              focusedName: 'flame.fill',
            },
            web: { name: 'flame' },
          }),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: 'Me',
          tabBarIcon: renderTabIcon({
            ios: {
              name: 'person',
              focusedName: 'person.fill',
            },
            web: { name: 'person' },
          }),
        }}
      />
    </Tabs>
  );
}
