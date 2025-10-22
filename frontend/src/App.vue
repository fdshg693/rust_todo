<template>
  <div class="app">
    <h1>🦀 Rust TODO App with Vue</h1>
    
    <div v-if="error" class="error">
      {{ error }}
    </div>
    
    <AddTodo @add="addTodo" />
    
    <div v-if="loading" class="loading">
      Loading todos...
    </div>
    <TodoList 
      v-else
      :todos="todos"
      @toggle="toggleTodo"
      @delete="deleteTodo"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TodoList from './components/TodoList.vue';
import AddTodo from './components/AddTodo.vue';
import type { Todo, TodoInput } from './types/todo';

const API_BASE = '/api/todos';

const todos = ref<Todo[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Fetch todos from the backend
const fetchTodos = async () => {
  try {
    loading.value = true;
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }
    const data = await response.json();
    todos.value = data;
    error.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  } finally {
    loading.value = false;
  }
};

// Add a new todo
const addTodo = async (todoData: TodoInput) => {
  try {
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
    error.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  }
};

// Toggle todo completion
const toggleTodo = async (id: string, completed: boolean) => {
  try {
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
    error.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  }
};

// Delete a todo
const deleteTodo = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }
    
    todos.value = todos.value.filter(todo => todo.id !== id);
    error.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  }
};

// Load todos on component mount
onMounted(() => {
  fetchTodos();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 2rem;
}

.error {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
}

.add-todo {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.add-todo input {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.add-todo input:focus {
  outline: none;
  border-color: #667eea;
}

.add-todo button {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
  white-space: nowrap;
}

.add-todo button:hover {
  background: #5568d3;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 1.2rem;
}

.todo-list {
  list-style: none;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 10px;
  transition: all 0.3s;
}

.todo-item:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
}

.todo-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-content {
  flex: 1;
}

.todo-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.todo-description {
  font-size: 0.9rem;
  color: #666;
}

.todo-actions {
  display: flex;
  gap: 8px;
}

.delete-btn {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
}

.delete-btn:hover {
  background: #c82333;
}
</style>
