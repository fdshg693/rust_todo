<template>
  <div class="todo-edit-form">
    <div class="form-group">
      <label for="edit-title">Title</label>
      <input
        id="edit-title"
        v-model="editTitle"
        type="text"
        class="edit-input"
        placeholder="Enter title"
        @keyup.enter="handleSave"
        @keyup.escape="handleCancel"
      />
    </div>
    <div class="form-group">
      <label for="edit-description">Description (optional)</label>
      <textarea
        id="edit-description"
        v-model="editDescription"
        class="edit-textarea"
        placeholder="Enter description"
        rows="3"
        @keyup.escape="handleCancel"
      ></textarea>
    </div>
    <div class="form-actions">
      <button 
        @click="handleSave" 
        class="save-btn"
        :disabled="!isValid"
      >
        Save
      </button>
      <button @click="handleCancel" class="cancel-btn">
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Todo } from '@/types/todo';

interface Props {
  todo: Todo;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  save: [data: { title: string; description: string | null }];
  cancel: [];
}>();

const editTitle = ref(props.todo.title);
const editDescription = ref(props.todo.description ?? '');

const isValid = computed(() => editTitle.value.trim().length > 0);

const handleSave = () => {
  if (!isValid.value) return;
  
  emit('save', {
    title: editTitle.value.trim(),
    description: editDescription.value.trim() || null,
  });
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.todo-edit-form {
  width: 100%;
  padding: 8px 0;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.edit-input,
.edit-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.edit-input:focus,
.edit-textarea:focus {
  outline: none;
  border-color: #4a90d9;
  box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.2);
}

.edit-textarea {
  resize: vertical;
  min-height: 60px;
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.save-btn,
.cancel-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-btn {
  background-color: #4a90d9;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background-color: #3a7bc8;
}

.save-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background-color: #e8e8e8;
}
</style>
