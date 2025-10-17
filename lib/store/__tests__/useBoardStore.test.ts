import { renderHook, act } from '@testing-library/react';
import { useBoardStore } from '../useBoardStore';
import type { Column, Task, ServiceError } from '../types';

describe('useBoardStore - 基盤機能', () => {
  beforeEach(() => {
    // 各テスト前にストアをリセット
    const { result } = renderHook(() => useBoardStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('初期状態', () => {
    it('columnsが空配列で初期化されている', () => {
      const { result } = renderHook(() => useBoardStore());
      expect(result.current.columns).toEqual([]);
    });

    it('tasksが空配列で初期化されている', () => {
      const { result } = renderHook(() => useBoardStore());
      expect(result.current.tasks).toEqual([]);
    });

    it('loadingがfalseで初期化されている', () => {
      const { result } = renderHook(() => useBoardStore());
      expect(result.current.loading).toBe(false);
    });

    it('errorがnullで初期化されている', () => {
      const { result } = renderHook(() => useBoardStore());
      expect(result.current.error).toBe(null);
    });
  });

  describe('setLoadingアクション', () => {
    it('loading状態を更新できる', () => {
      const { result } = renderHook(() => useBoardStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.loading).toBe(true);
    });
  });

  describe('setErrorアクション', () => {
    it('error状態を設定できる', () => {
      const { result } = renderHook(() => useBoardStore());
      const error: ServiceError = {
        code: 'TEST_ERROR',
        message: 'Test error message',
      };

      act(() => {
        result.current.setError(error);
      });

      expect(result.current.error).toEqual(error);
    });

    it('error状態をクリアできる', () => {
      const { result } = renderHook(() => useBoardStore());
      const error: ServiceError = {
        code: 'TEST_ERROR',
        message: 'Test error message',
      };

      act(() => {
        result.current.setError(error);
      });

      expect(result.current.error).toEqual(error);

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('setColumnsアクション', () => {
    it('columns状態を更新できる', () => {
      const { result } = renderHook(() => useBoardStore());
      const columns: Column[] = [
        {
          id: 'col-1',
          userId: 'user-1',
          name: '未着手',
          position: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-2',
          userId: 'user-1',
          name: '進行中',
          position: 1,
          createdAt: new Date().toISOString(),
        },
      ];

      act(() => {
        result.current.setColumns(columns);
      });

      expect(result.current.columns).toEqual(columns);
    });
  });

  describe('setTasksアクション', () => {
    it('tasks状態を更新できる', () => {
      const { result } = renderHook(() => useBoardStore());
      const tasks: Task[] = [
        {
          id: 'task-1',
          userId: 'user-1',
          columnId: 'col-1',
          title: 'タスク1',
          description: 'テスト用タスク',
          priority: 'medium',
          position: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      act(() => {
        result.current.setTasks(tasks);
      });

      expect(result.current.tasks).toEqual(tasks);
    });
  });

  describe('resetアクション', () => {
    it('ストアを初期状態にリセットできる', () => {
      const { result } = renderHook(() => useBoardStore());

      // 状態を変更
      act(() => {
        result.current.setColumns([
          {
            id: 'col-1',
            userId: 'user-1',
            name: 'テスト列',
            position: 0,
            createdAt: new Date().toISOString(),
          },
        ]);
        result.current.setLoading(true);
        result.current.setError({ code: 'ERROR', message: 'Error' });
      });

      expect(result.current.columns.length).toBe(1);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).not.toBe(null);

      // リセット
      act(() => {
        result.current.reset();
      });

      expect(result.current.columns).toEqual([]);
      expect(result.current.tasks).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });
});
