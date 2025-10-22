<template>
  <div class="app">
    <h1>🦀 Rust TODO App with Vue</h1>
    
    <div v-if="todoStore.error" class="error">
      {{ todoStore.error }}
      <button @click="todoStore.clearError" class="error-close">×</button>
    </div>
    
    <AddTodo @add="handleAddTodo" />
    
    <div v-if="todoStore.loading" class="loading">
      Loading todos...
    </div>
    <TodoList 
      v-else
      :todos="todoStore.todos"
      @toggle="handleToggleTodo"
      @delete="handleDeleteTodo"
    />
    
    <div v-if="todoStore.todos.length > 0" class="stats">
      <p>Total: {{ todoStore.todosCount.total }} | 
         Completed: {{ todoStore.todosCount.completed }} | 
         Active: {{ todoStore.todosCount.active }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import TodoList from './components/TodoList.vue';
import AddTodo from './components/AddTodo.vue';
import { useTodoStore } from './stores/todo';
import type { TodoInput } from './types/todo';

const todoStore = useTodoStore();

// Handle add todo
const handleAddTodo = async (todoData: TodoInput) => {
  await todoStore.addTodo(todoData);
};

// Handle toggle todo
const handleToggleTodo = async (id: string, completed: boolean) => {
  await todoStore.toggleTodo(id, completed);
};

// Handle delete todo
const handleDeleteTodo = async (id: string) => {
  await todoStore.deleteTodo(id);
};

// Load todos on component mount
onMounted(() => {
  todoStore.fetchTodos();
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

.stats {
  text-align: center;
  margin-top: 20px;
  padding: 15px;
  background: #f0f0f0;
  border-radius: 8px;
  color: #666;
  font-size: 0.9rem;
}

.error {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.error-close {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 8px;
  line-height: 1;
}

.error-close:hover {
  opacity: 0.8;
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
