import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { renderTabIcon } from '../../src/components/ui/TabIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: Platform.select({
          web: { height: 60 },
        }),
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
      {/* COMING SOON!
            Remember to move daily.tsx back to (tabs)
            from `src/wip` when we're ready to use it again.
      */}
      {/* <Tabs.Screen
        name="daily"
        options={{
          title: 'Daily Challenges',
          tabBarIcon: renderTabIcon({
            ios: { name: 'calendar.badge.checkmark' },
            web: { name: 'calendar' },
          }),
        }}
      /> */}
    </Tabs>
  );
}
