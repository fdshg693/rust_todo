/**
 * Integration-like tests that verify real-world scenarios
 * These tests focus on edge cases and business logic, not just mock returns
 */

import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  ApiError,
} from '../todoApi';
import type { Todo, TodoInput } from '../../types/todo';

// Mock global fetch
global.fetch = jest.fn();

describe('TodoAPI - Integration & Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Error transformation logic', () => {
    it('should transform HTTP 404 into ApiError with correct status code', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      try {
        await fetchTodos();
        fail('Should have thrown an error');
      } catch (error) {
        // ここが重要：ResponseオブジェクトがApiErrorに正しく変換されているか
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(404);
        expect((error as ApiError).message).toContain('404');
      }
    });

    it('should handle 401 Unauthorized correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      try {
        await fetchTodos();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(401);
        expect((error as ApiError).message).toContain('Unauthorized');
      }
    });

    it('should wrap network errors in ApiError', async () => {
      const networkError = new TypeError('Failed to fetch');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      try {
        await fetchTodos();
        fail('Should have thrown an error');
      } catch (error) {
        // 生のTypeErrorではなくApiErrorでラップされているか確認
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe('Failed to fetch');
        expect((error as ApiError).statusCode).toBeUndefined();
      }
    });
  });

  describe('Edge cases and special handling', () => {
    it('should handle 204 No Content response correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
        // 204では json() を呼べないことがある
      });

      // 204は空オブジェクトを返すことを確認（実装の仕様）
      const result = await deleteTodo('1');
      expect(result).toEqual({});
    });

    it('should handle malformed JSON gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Unexpected token in JSON');
        },
      });

      try {
        await fetchTodos();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toContain('Unexpected token');
      }
    });

    it('should handle empty array response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await fetchTodos();
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle todo with null description', async () => {
      const mockTodo: Todo = {
        id: '1',
        title: 'Test',
        description: null, // null は有効な値
        completed: false,
        created_at: '2025-10-22T00:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockTodo],
      });

      const result = await fetchTodos();
      expect(result[0].description).toBeNull();
      expect(result[0].description).not.toBeUndefined();
    });
  });

  describe('Request formatting validation', () => {
    it('should send correct Content-Type header', async () => {
      const todoInput: TodoInput = { title: 'Test' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', ...todoInput, completed: false, created_at: '' }),
      });

      await createTodo(todoInput);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].headers['Content-Type']).toBe('application/json');
    });

    it('should properly serialize request body', async () => {
      const todoInput: TodoInput = {
        title: 'Test with "quotes"',
        description: 'Line1\nLine2', // 改行を含む
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', ...todoInput, completed: false, created_at: '' }),
      });

      await createTodo(todoInput);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const sentBody = JSON.parse(callArgs[1].body);
      
      // 正しくシリアライズ・デシリアライズされているか
      expect(sentBody.title).toBe('Test with "quotes"');
      expect(sentBody.description).toBe('Line1\nLine2');
    });

    it('should use correct HTTP methods', async () => {
      const operations = [
        { fn: () => fetchTodos(), expectedMethod: undefined }, // GET
        { fn: () => createTodo({ title: 'Test' }), expectedMethod: 'POST' },
        { fn: () => updateTodo('1', { completed: true }), expectedMethod: 'PUT' },
        { fn: () => deleteTodo('1'), expectedMethod: 'DELETE' },
      ];

      for (const op of operations) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: op.expectedMethod === 'DELETE' ? 204 : 200,
          json: async () => ({}),
        });

        await op.fn();

        const lastCall = (global.fetch as jest.Mock).mock.calls[
          (global.fetch as jest.Mock).mock.calls.length - 1
        ];
        
        if (op.expectedMethod) {
          expect(lastCall[1].method).toBe(op.expectedMethod);
        }
      }
    });
  });

  describe('URL construction', () => {
    it('should construct correct URLs for different operations', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({}),
      };

      // fetchTodos
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      await fetchTodos();
      expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe('/api/todos');

      // createTodo
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      await createTodo({ title: 'Test' });
      expect((global.fetch as jest.Mock).mock.calls[1][0]).toBe('/api/todos');

      // updateTodo with ID
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      await updateTodo('abc-123', { completed: true });
      expect((global.fetch as jest.Mock).mock.calls[2][0]).toBe('/api/todos/abc-123');

      // deleteTodo with special characters in ID
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ...mockResponse, status: 204 });
      await deleteTodo('id-with-dash');
      expect((global.fetch as jest.Mock).mock.calls[3][0]).toBe('/api/todos/id-with-dash');
    });
  });

  describe('Concurrent request handling', () => {
    it('should handle multiple simultaneous requests', async () => {
      // 3つの同時リクエストをシミュレート
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ id: '1', title: 'Todo 1', completed: false, created_at: '' }],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: '2', title: 'Todo 2', completed: false, created_at: '' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 204,
        });

      const [todos, newTodo, deleteResult] = await Promise.all([
        fetchTodos(),
        createTodo({ title: 'Todo 2' }),
        deleteTodo('3'),
      ]);

      expect(todos).toHaveLength(1);
      expect(newTodo.id).toBe('2');
      expect(deleteResult).toEqual({}); // 204 returns empty object
      expect((global.fetch as jest.Mock)).toHaveBeenCalledTimes(3);
    });
  });

  describe('Type safety validation', () => {
    it('should maintain type safety for Todo object', async () => {
      const incompleteTodo = {
        id: '1',
        title: 'Test',
        // completed is missing - バックエンドのバグをシミュレート
        created_at: '2025-10-22T00:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [incompleteTodo],
      });

      const result = await fetchTodos();
      
      // TypeScriptの型定義に従っているが、実際のデータは不完全
      // これはランタイムエラーを引き起こす可能性がある
      expect(result[0].completed).toBeUndefined();
    });
  });
});
