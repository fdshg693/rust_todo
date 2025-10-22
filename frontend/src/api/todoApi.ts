import type { Todo, TodoInput, TodoUpdate } from '../types/todo';

const API_BASE = '/api/todos';

/**
 * Custom API Error class for better error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      throw new ApiError(errorMessage, response.status, response);
    }
    
    // Handle 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }
    
    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network errors or other fetch failures
    throw new ApiError(
      error instanceof Error ? error.message : 'An unknown error occurred'
    );
  }
}

/**
 * Fetch all todos
 */
export async function fetchTodos(): Promise<Todo[]> {
  return fetchWithErrorHandling<Todo[]>(API_BASE);
}

/**
 * Create a new todo
 */
export async function createTodo(todoData: TodoInput): Promise<Todo> {
  return fetchWithErrorHandling<Todo>(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(todoData),
  });
}

/**
 * Update a todo (toggle completion status)
 */
export async function updateTodo(
  id: string,
  updateData: TodoUpdate
): Promise<Todo> {
  return fetchWithErrorHandling<Todo>(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
}

/**
 * Delete a todo
 */
export async function deleteTodo(id: string): Promise<void> {
  return fetchWithErrorHandling<void>(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
}

/**
 * TodoApi object for easier imports
 */
export const todoApi = {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
};

export default todoApi;
