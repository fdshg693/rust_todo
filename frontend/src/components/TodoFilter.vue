<template>
  <!--
    TodoFilter Component
    
    Provides UI controls for filtering and sorting the TODO list.
    This component uses the Pinia store directly for state management.
    
    Features:
    - Filter buttons: All / Active / Completed
    - Sort dropdown: Created Date / Title
    - Sort order toggle button
  -->
  <div class="todo-filter">
    <!-- Filter Section -->
    <div class="filter-section">
      <span class="section-label">フィルター:</span>
      <div class="filter-buttons">
        <!--
          v-for iterates over predefined filter options
          :class binding applies 'active' class when this filter is selected
          @click calls the store action to update the filter
        -->
        <button
          v-for="option in FILTER_OPTIONS"
          :key="option.value"
          :class="['filter-btn', { active: todoStore.currentFilter === option.value }]"
          @click="todoStore.setFilter(option.value)"
          :aria-pressed="todoStore.currentFilter === option.value"
        >
          <span v-if="option.icon" class="btn-icon">{{ option.icon }}</span>
          {{ option.label }}
          <!-- Show count badge for each filter type -->
          <span class="count-badge">{{ getFilterCount(option.value) }}</span>
        </button>
      </div>
    </div>
    
    <!-- Sort Section -->
    <div class="sort-section">
      <span class="section-label">並び替え:</span>
      <div class="sort-controls">
        <!--
          v-model creates two-way binding with the store's currentSort
          We use a computed getter/setter to properly interface with Pinia
        -->
        <select
          v-model="sortValue"
          class="sort-select"
          aria-label="並び替え基準"
        >
          <option
            v-for="option in SORT_OPTIONS"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        
        <!--
          Sort order toggle button
          Uses computed class and emoji to indicate current direction
        -->
        <button
          class="sort-order-btn"
          @click="todoStore.toggleSortOrder()"
          :aria-label="sortOrderLabel"
          :title="sortOrderLabel"
        >
          {{ sortOrderIcon }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * TodoFilter Component
 * 
 * Displays filter buttons and sort controls for the TODO list.
 * Interacts directly with the Pinia store to update filter/sort state.
 * 
 * Design Decision: This component uses the store directly rather than
 * props/emit because filter state is application-wide and doesn't need
 * to be passed through parent components.
 */
import { computed } from 'vue';
import { useTodoStore } from '@/stores/todo';
import { FILTER_OPTIONS, SORT_OPTIONS } from '@/types/filter';
import type { FilterType, SortType } from '@/types/filter';

// Access the Pinia store
const todoStore = useTodoStore();

/**
 * Computed getter/setter for sort value
 * 
 * This pattern is necessary when using v-model with Pinia state.
 * v-model requires both read (get) and write (set) operations.
 * 
 * @see https://vuejs.org/guide/components/v-model.html#using-v-model-on-a-component
 */
const sortValue = computed({
  get: () => todoStore.currentSort,
  set: (value: SortType) => todoStore.setSort(value),
});

/**
 * Returns the count of todos for each filter type
 * Used to display count badges on filter buttons
 * 
 * @param filter - The filter type to get count for
 * @returns Number of todos matching the filter
 */
const getFilterCount = (filter: FilterType): number => {
  switch (filter) {
    case 'all':
      return todoStore.todosCount.total;
    case 'active':
      return todoStore.todosCount.active;
    case 'completed':
      return todoStore.todosCount.completed;
    default:
      return 0;
  }
};

/**
 * Computed property for sort order icon
 * Shows up/down arrow based on current sort direction
 */
const sortOrderIcon = computed(() => 
  todoStore.currentSortOrder === 'asc' ? '↑' : '↓'
);

/**
 * Computed property for sort order accessibility label
 */
const sortOrderLabel = computed(() => 
  todoStore.currentSortOrder === 'asc' ? '昇順 (クリックで降順に変更)' : '降順 (クリックで昇順に変更)'
);
</script>

<style scoped>
/**
 * Scoped styles for TodoFilter component
 * 
 * Using 'scoped' attribute ensures these styles only apply to this component,
 * preventing CSS conflicts with other components.
 */

.todo-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
  align-items: center;
  justify-content: space-between;
}

.section-label {
  font-size: 0.9rem;
  color: #666;
  margin-right: 10px;
  font-weight: 500;
}

/* Filter Section */
.filter-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  color: #555;
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.btn-icon {
  font-size: 1rem;
}

.count-badge {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  min-width: 24px;
  text-align: center;
}

.filter-btn.active .count-badge {
  background: rgba(255, 255, 255, 0.3);
}

/* Sort Section */
.sort-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sort-select {
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  color: #555;
  transition: border-color 0.2s ease;
}

.sort-select:focus {
  outline: none;
  border-color: #667eea;
}

.sort-order-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  color: #555;
}

.sort-order-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

/* Responsive Design */
@media (max-width: 600px) {
  .todo-filter {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-buttons {
    flex-wrap: wrap;
  }
  
  .filter-btn {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
}
</style>
