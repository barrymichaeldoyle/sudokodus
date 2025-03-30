import { View, Text } from 'react-native';

import '../global.css';

interface Todo {
  id: number;
  title: string;
  created_at?: string;
  completed?: boolean;
}

export function App() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Todo List</Text>
    </View>
  );
}
