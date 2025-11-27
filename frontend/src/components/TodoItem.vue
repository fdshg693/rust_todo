<template>
  <li :class="['todo-item', { completed: todo.completed }]">
    <template v-if="isEditing">
      <TodoEditForm
        :todo="todo"
        @save="handleSave"
        @cancel="handleCancelEdit"
      />
    </template>
    <template v-else>
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
        <button @click="handleEdit" class="edit-btn">
          Edit
        </button>
        <button @click="handleDelete" class="delete-btn">
          Delete
        </button>
      </div>
    </template>
  </li>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Todo } from '@/types/todo';
import TodoEditForm from './TodoEditForm.vue';

interface Props {
  todo: Todo;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [id: string, completed: boolean];
  delete: [id: string];
  update: [id: string, data: { title: string; description: string | null }];
}>();

const isEditing = ref(false);

const handleToggle = () => {
  emit('toggle', props.todo.id, !props.todo.completed);
};

const handleDelete = () => {
  emit('delete', props.todo.id);
};

const handleEdit = () => {
  isEditing.value = true;
};

const handleSave = (data: { title: string; description: string | null }) => {
  emit('update', props.todo.id, data);
  isEditing.value = false;
};

const handleCancelEdit = () => {
  isEditing.value = false;
};
</script>

<style scoped>
.edit-btn {
  padding: 4px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 8px;
  transition: background-color 0.2s;
}

.edit-btn:hover {
  background-color: #e0e0e0;
}
</style>
