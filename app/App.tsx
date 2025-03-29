import { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { supabase } from '../utils/supabase';

import '../global.css';

interface Todo {
  id: number;
  title: string;
  created_at?: string;
  completed?: boolean;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const getTodos = async () => {
      try {
        const { data: todos, error } = await supabase.from('todos').select();

        if (error) {
          console.error('Error fetching todos:', error.message);
          return;
        }

        if (todos && todos.length > 0) {
          setTodos(todos);
        }
      } catch (error) {
        console.error(
          'Error fetching todos:',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    };

    getTodos();
  }, []);

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
