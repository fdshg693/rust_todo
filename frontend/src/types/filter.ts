/**
 * Filter and Sort Type Definitions
 * 
 * This file defines the types used for filtering and sorting TODOs.
 * These types ensure type safety throughout the filter/sort feature.
 */

/**
 * FilterType - Represents the filter options for TODO visibility
 * 
 * - 'all': Show all todos regardless of completion status
 * - 'active': Show only incomplete todos
 * - 'completed': Show only completed todos
 * 
 * @example
 * const filter: FilterType = 'active';
 * // This will filter to show only incomplete todos
 */
export type FilterType = 'all' | 'active' | 'completed';

/**
 * SortType - Represents the sort options for TODO ordering
 * 
 * - 'created_at': Sort by creation date (newest first by default)
 * - 'title': Sort alphabetically by title (A-Z)
 * 
 * @example
 * const sortBy: SortType = 'title';
 * // This will sort todos alphabetically
 */
export type SortType = 'created_at' | 'title';

/**
 * SortOrder - Represents the direction of sorting
 * 
 * - 'asc': Ascending order (A-Z, oldest first)
 * - 'desc': Descending order (Z-A, newest first)
 */
export type SortOrder = 'asc' | 'desc';

/**
 * FilterOption - Configuration object for filter UI display
 * Used to render filter buttons with consistent styling and labels
 */
export interface FilterOption {
  /** The filter value to apply */
  value: FilterType;
  /** Display label for the filter button */
  label: string;
  /** Optional icon/emoji for visual identification */
  icon?: string;
}

/**
 * SortOption - Configuration object for sort UI display
 * Used to render sort dropdown options
 */
export interface SortOption {
  /** The sort field to apply */
  value: SortType;
  /** Display label for the sort option */
  label: string;
}

/**
 * Predefined filter options for UI rendering
 * These can be used directly in v-for loops
 */
export const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'すべて', icon: '📋' },
  { value: 'active', label: '未完了', icon: '⏳' },
  { value: 'completed', label: '完了済み', icon: '✅' },
];

/**
 * Predefined sort options for UI rendering
 */
export const SORT_OPTIONS: SortOption[] = [
  { value: 'created_at', label: '作成日順' },
  { value: 'title', label: 'タイトル順' },
];
