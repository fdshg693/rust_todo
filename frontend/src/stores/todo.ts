import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Todo, TodoInput } from '../types/todo';

const API_BASE = '/api/todos';

export const useTodoStore = defineStore('todo', () => {
  // State
  const todos = ref<Todo[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const completedTodos = computed(() => 
    todos.value.filter(todo => todo.completed)
  );

  const activeTodos = computed(() => 
    todos.value.filter(todo => !todo.completed)
  );

  const todosCount = computed(() => ({
    total: todos.value.length,
    completed: completedTodos.value.length,
    active: activeTodos.value.length,
  }));

  // Actions
  const fetchTodos = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await fetch(API_BASE);
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      
      const data = await response.json();
      todos.value = data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error fetching todos:', err);
    } finally {
      loading.value = false;
    }
  };

  const addTodo = async (todoData: TodoInput) => {
    try {
      error.value = null;
      
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create todo');
      }
      
      const newTodo = await response.json();
      todos.value = [newTodo, ...todos.value];
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error adding todo:', err);
      throw err;
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      error.value = null;
      
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update todo');
      }
      
      const updatedTodo = await response.json();
      todos.value = todos.value.map(todo => 
        todo.id === id ? updatedTodo : todo
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error toggling todo:', err);
      throw err;
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      error.value = null;
      
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }
      
      todos.value = todos.value.filter(todo => todo.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error deleting todo:', err);
      throw err;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    todos,
    loading,
    error,
    
    // Getters
    completedTodos,
    activeTodos,
    todosCount,
    
    // Actions
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearError,
  };
});
