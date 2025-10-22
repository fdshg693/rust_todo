<template>
  <div v-if="todos.length === 0" class="empty-state">
    <p>No todos yet. Add one above to get started! 🚀</p>
  </div>
  <ul v-else class="todo-list">
    <TodoItem
      v-for="todo in todos"
      :key="todo.id"
      :todo="todo"
      @toggle="handleToggle"
      @delete="handleDelete"
    />
  </ul>
</template>

<script setup lang="ts">
import TodoItem from './TodoItem.vue';
import type { Todo } from '@/types/todo';

interface Props {
  todos: Todo[];
}

defineProps<Props>();

const emit = defineEmits<{
  toggle: [id: string, completed: boolean];
  delete: [id: string];
}>();

const handleToggle = (id: string, completed: boolean) => {
  emit('toggle', id, completed);
};

const handleDelete = (id: string) => {
  emit('delete', id);
};
</script>
