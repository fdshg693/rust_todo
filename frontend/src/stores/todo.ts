import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Todo, TodoInput, TodoUpdateInput } from '../types/todo';
import type { FilterType, SortType, SortOrder } from '../types/filter';
import * as todoApi from '../api/todoApi';

/**
 * Todo Store
 * 
 * Pinia store using Composition API syntax for managing TODO state.
 * Includes filtering, sorting, and CRUD operations.
 */
export const useTodoStore = defineStore('todo', () => {
  // ==========================================
  // State
  // ==========================================
  
  /** All todos fetched from the API */
  const todos = ref<Todo[]>([]);
  
  /** Loading state for async operations */
  const loading = ref(false);
  
  /** Error message for failed operations */
  const error = ref<string | null>(null);
  
  /**
   * Current filter type for TODO visibility
   * See types/filter.ts for FilterType definition
   */
  const currentFilter = ref<FilterType>('all');
  
  /**
   * Current sort field
   * - 'created_at': Sort by creation date
   * - 'title': Sort alphabetically
   */
  const currentSort = ref<SortType>('created_at');
  
  /**
   * Sort direction
   * - 'desc': Newest first / Z-A
   * - 'asc': Oldest first / A-Z
   */
  const currentSortOrder = ref<SortOrder>('desc');

  // ==========================================
  // Getters (Computed Properties)
  // ==========================================
  
  /**
   * Filters todos based on completion status
   * Uses currentFilter state to determine which todos to show
   */
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

  /**
   * Filtered and sorted todos - the main computed property for display
   * 
   * This computed property chains two operations:
   * 1. Filter: Based on currentFilter ('all', 'active', 'completed')
   * 2. Sort: Based on currentSort and currentSortOrder
   * 
   * Vue's reactivity system automatically recalculates when any dependency changes.
   * 
   * @example
   * // When currentFilter = 'active' and currentSort = 'title':
   * // Returns only incomplete todos, sorted alphabetically
   */
  const filteredSortedTodos = computed(() => {
    // Step 1: Filter based on currentFilter
    let result: Todo[];
    
    switch (currentFilter.value) {
      case 'active':
        result = todos.value.filter(todo => !todo.completed);
        break;
      case 'completed':
        result = todos.value.filter(todo => todo.completed);
        break;
      case 'all':
      default:
        result = [...todos.value];
    }
    
    // Step 2: Sort based on currentSort and currentSortOrder
    result.sort((a, b) => {
      let comparison = 0;
      
      if (currentSort.value === 'title') {
        // Alphabetical sort using localeCompare for proper string comparison
        comparison = a.title.localeCompare(b.title, 'ja');
      } else {
        // Date sort - compare ISO date strings (works because ISO format is sortable)
        comparison = a.created_at.localeCompare(b.created_at);
      }
      
      // Reverse for descending order
      return currentSortOrder.value === 'desc' ? -comparison : comparison;
    });
    
    return result;
  });

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

  const updateTodo = async (id: string, updateData: TodoUpdateInput) => {
    try {
      error.value = null;
      
      const updatedTodo = await todoApi.updateTodoPartial(id, updateData);
      todos.value = todos.value.map(todo => 
        todo.id === id ? updatedTodo : todo
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error updating todo:', err);
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

  // ==========================================
  // Filter & Sort Actions
  // ==========================================
  
  /**
   * Updates the current filter type
   * Triggers automatic recalculation of filteredSortedTodos
   * 
   * @param filter - The new filter type ('all' | 'active' | 'completed')
   */
  const setFilter = (filter: FilterType) => {
    currentFilter.value = filter;
  };
  
  /**
   * Updates the current sort field
   * 
   * @param sort - The sort field ('created_at' | 'title')
   */
  const setSort = (sort: SortType) => {
    currentSort.value = sort;
  };
  
  /**
   * Updates the sort order direction
   * 
   * @param order - The sort direction ('asc' | 'desc')
   */
  const setSortOrder = (order: SortOrder) => {
    currentSortOrder.value = order;
  };
  
  /**
   * Toggles the sort order between ascending and descending
   * Useful for sort direction toggle buttons
   */
  const toggleSortOrder = () => {
    currentSortOrder.value = currentSortOrder.value === 'asc' ? 'desc' : 'asc';
  };

  return {
    // State
    todos,
    loading,
    error,
    currentFilter,
    currentSort,
    currentSortOrder,
    
    // Getters
    completedTodos,
    activeTodos,
    todosCount,
    filteredSortedTodos,
    
    // Actions
    fetchTodos,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    clearError,
    setFilter,
    setSort,
    setSortOrder,
    toggleSortOrder,
  };
});
