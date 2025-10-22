<template>
  <form @submit.prevent="handleSubmit" class="add-todo">
    <input
      type="text"
      placeholder="Enter todo title..."
      v-model="title"
    />
    <input
      type="text"
      placeholder="Description (optional)..."
      v-model="description"
    />
    <button type="submit">Add Todo</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TodoInput } from '@/types/todo';

const emit = defineEmits<{
  add: [todo: TodoInput]
}>();

const title = ref('');
const description = ref('');

const handleSubmit = () => {
  if (!title.value.trim()) {
    return;
  }

  emit('add', {
    title: title.value.trim(),
    description: description.value.trim() || undefined,
  });

  title.value = '';
  description.value = '';
};
</script>
