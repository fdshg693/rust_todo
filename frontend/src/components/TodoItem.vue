<template>
  <li :class="['todo-item', { completed: todo.completed }]">
    <input
      type="checkbox"
      :checked="todo.completed"
      @change="handleToggle"
    />
    <div class="todo-content">
      <div class="todo-title">{{ todo.title }}</div>
      <div v-if="todo.description" class="todo-description">
        {{ todo.description }}
      </div>
    </div>
    <div class="todo-actions">
      <button @click="handleDelete" class="delete-btn">
        Delete
      </button>
    </div>
  </li>
</template>

<script setup lang="ts">
import type { Todo } from '@/types/todo';

interface Props {
  todo: Todo;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [id: string, completed: boolean];
  delete: [id: string];
}>();

const handleToggle = () => {
  emit('toggle', props.todo.id, !props.todo.completed);
};

const handleDelete = () => {
  emit('delete', props.todo.id);
};
</script>
