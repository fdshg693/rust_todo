import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Todo, TodoInput } from '../types/todo';
import * as todoApi from '../api/todoApi';

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
      
      const data = await todoApi.fetchTodos();
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
      
      const newTodo = await todoApi.createTodo(todoData);
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
      
      const updatedTodo = await todoApi.updateTodo(id, { completed });
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
      
      await todoApi.deleteTodo(id);
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
