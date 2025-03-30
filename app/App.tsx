import { useState } from 'react';
import { View, Text, FlatList } from 'react-native';

import '../global.css';

interface Todo {
  id: number;
  title: string;
  created_at?: string;
  completed?: boolean;
}

export function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Todo List</Text>
      <FlatList
        data={todos}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <Text key={item.id}>{item.title}</Text>}
      />
    </View>
  );
}
