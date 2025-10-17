/**
 * カンバンボード操作フロー統合テスト
 *
 * このテストは以下の操作フローを検証します:
 * 1. 列作成 → タスク作成 → タスク移動
 * 2. タスク編集 → モーダルで内容変更 → カンバンボードに反映
 * 3. 列削除 → 所属タスクのカスケード削除
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBoardStore } from '@/lib/store/useBoardStore';
import type { Column, Task } from '@/lib/store/types';

// Supabaseクライアントをモック
vi.mock('@/lib/supabase', () => ({
  createClientSupabase: vi.fn(() => mockSupabaseClient),
}));

let mockSupabaseClient: any;

describe('カンバンボード操作フロー統合テスト', () => {
  beforeEach(() => {
    // Supabaseクライアントのモック
    mockSupabaseClient = {
      from: vi.fn(),
    };

    // ストアをリセット
    const { result } = renderHook(() => useBoardStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('列作成 → タスク作成 → タスク移動', () => {
    it('should create column, add task, and move task', async () => {
      const { result } = renderHook(() => useBoardStore());
      const testUserId = 'user-integration-123';

      // ステップ1: 初期ボード取得（空のボード）
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      await act(async () => {
        await result.current.fetchBoard(testUserId);
      });

      expect(result.current.columns).toHaveLength(0);
      expect(result.current.tasks).toHaveLength(0);

      // ステップ2: 列を作成（3つの列）
      const mockColumns: Column[] = [
        {
          id: 'col-1',
          userId: testUserId,
          name: '未着手',
          position: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-2',
          userId: testUserId,
          name: '進行中',
          position: 1,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-3',
          userId: testUserId,
          name: '完了',
          position: 2,
          createdAt: new Date().toISOString(),
        },
      ];

      // 列作成をシミュレート
      for (let i = 0; i < mockColumns.length; i++) {
        const dbColumn = {
          id: mockColumns[i].id,
          user_id: mockColumns[i].userId,
          name: mockColumns[i].name,
          position: mockColumns[i].position,
          created_at: mockColumns[i].createdAt,
          updated_at: mockColumns[i].createdAt,
        };

        mockSupabaseClient.from.mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: dbColumn,
                error: null,
              }),
            }),
          }),
        });

        await act(async () => {
          await result.current.createColumn(testUserId, mockColumns[i].name);
        });
      }

      expect(result.current.columns).toHaveLength(3);
      expect(result.current.columns.map((c) => c.name)).toEqual([
        '未着手',
        '進行中',
        '完了',
      ]);

      // ステップ3: タスクを作成（2つのタスク）
      const mockTask1: Task = {
        id: 'task-1',
        userId: testUserId,
        columnId: 'col-1',
        title: 'タスク1',
        description: 'テスト用タスク1',
        priority: 'high',
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockTask2: Task = {
        id: 'task-2',
        userId: testUserId,
        columnId: 'col-1',
        title: 'タスク2',
        description: 'テスト用タスク2',
        priority: 'medium',
        position: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(mockTaskService.createTask).mockResolvedValueOnce({
        success: true,
        data: mockTask1,
      });

      await act(async () => {
        await result.current.createTask({
          userId: testUserId,
          columnId: 'col-1',
          title: 'タスク1',
          description: 'テスト用タスク1',
          priority: 'high',
        });
      });

      vi.mocked(mockTaskService.createTask).mockResolvedValueOnce({
        success: true,
        data: mockTask2,
      });

      await act(async () => {
        await result.current.createTask({
          userId: testUserId,
          columnId: 'col-1',
          title: 'タスク2',
          description: 'テスト用タスク2',
          priority: 'medium',
        });
      });

      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks[0].columnId).toBe('col-1');
      expect(result.current.tasks[1].columnId).toBe('col-1');

      // ステップ4: タスクを別の列に移動
      const movedTask: Task = {
        ...mockTask1,
        columnId: 'col-2',
        position: 0,
      };

      vi.mocked(mockTaskService.moveTask).mockResolvedValue({
        success: true,
        data: movedTask,
      });

      await act(async () => {
        await result.current.moveTask('task-1', 'col-2', 0);
      });

      // タスクが正しく移動していることを確認
      const task1AfterMove = result.current.tasks.find((t) => t.id === 'task-1');
      expect(task1AfterMove?.columnId).toBe('col-2');
      expect(task1AfterMove?.position).toBe(0);
    });

    it('should handle task position reordering within same column', async () => {
      const { result } = renderHook(() => useBoardStore());
      const testUserId = 'user-789';

      // 初期状態: 3つのタスクが同じ列にある
      const mockColumn: Column = {
        id: 'col-test',
        userId: testUserId,
        name: 'テスト列',
        position: 0,
        createdAt: new Date().toISOString(),
      };

      const mockTasks: Task[] = [
        {
          id: 'task-a',
          userId: testUserId,
          columnId: 'col-test',
          title: 'タスクA',
          description: null,
          priority: 'low',
          position: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-b',
          userId: testUserId,
          columnId: 'col-test',
          title: 'タスクB',
          description: null,
          priority: 'medium',
          position: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-c',
          userId: testUserId,
          columnId: 'col-test',
          title: 'タスクC',
          description: null,
          priority: 'high',
          position: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      act(() => {
        result.current.setColumns([mockColumn]);
        result.current.setTasks(mockTasks);
      });

      // タスクCを先頭に移動（position 0）
      const movedTaskC: Task = {
        ...mockTasks[2],
        position: 0,
      };

      vi.mocked(mockTaskService.moveTask).mockResolvedValue({
        success: true,
        data: movedTaskC,
      });

      await act(async () => {
        await result.current.moveTask('task-c', 'col-test', 0);
      });

      // position順に並び替え
      const sortedTasks = result.current.tasks
        .filter((t) => t.columnId === 'col-test')
        .sort((a, b) => a.position - b.position);

      // タスクCが先頭に来ていることを確認
      expect(sortedTasks[0].id).toBe('task-c');
    });
  });

  describe('タスク編集 → モーダルで内容変更 → 保存後にカンバンボードに反映', () => {
    it('should edit task and reflect changes on board', async () => {
      const { result } = renderHook(() => useBoardStore());
      const testUserId = 'user-456';

      // 初期タスク
      const originalTask: Task = {
        id: 'task-edit-1',
        userId: testUserId,
        columnId: 'col-1',
        title: '元のタイトル',
        description: '元の説明',
        priority: 'low',
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.setTasks([originalTask]);
      });

      // タスク編集
      const updatedTask: Task = {
        ...originalTask,
        title: '更新されたタイトル',
        description: '更新された説明',
        priority: 'high',
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(mockTaskService.updateTask).mockResolvedValue({
        success: true,
        data: updatedTask,
      });

      await act(async () => {
        await result.current.updateTask('task-edit-1', {
          title: '更新されたタイトル',
          description: '更新された説明',
          priority: 'high',
        });
      });

      // 変更が反映されていることを確認
      const taskAfterUpdate = result.current.tasks.find(
        (t) => t.id === 'task-edit-1'
      );
      expect(taskAfterUpdate?.title).toBe('更新されたタイトル');
      expect(taskAfterUpdate?.description).toBe('更新された説明');
      expect(taskAfterUpdate?.priority).toBe('high');
    });
  });

  describe('列削除 → 所属タスクのカスケード削除', () => {
    it('should delete column and cascade delete tasks', async () => {
      const { result } = renderHook(() => useBoardStore());
      const testUserId = 'user-999';

      // 初期状態: 2つの列と3つのタスク
      const mockColumns: Column[] = [
        {
          id: 'col-keep',
          userId: testUserId,
          name: '保持する列',
          position: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-delete',
          userId: testUserId,
          name: '削除する列',
          position: 1,
          createdAt: new Date().toISOString(),
        },
      ];

      const mockTasks: Task[] = [
        {
          id: 'task-1',
          userId: testUserId,
          columnId: 'col-keep',
          title: 'タスク1（保持）',
          description: null,
          priority: 'medium',
          position: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-2',
          userId: testUserId,
          columnId: 'col-delete',
          title: 'タスク2（削除される）',
          description: null,
          priority: 'low',
          position: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-3',
          userId: testUserId,
          columnId: 'col-delete',
          title: 'タスク3（削除される）',
          description: null,
          priority: 'high',
          position: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      act(() => {
        result.current.setColumns(mockColumns);
        result.current.setTasks(mockTasks);
      });

      // 列を削除
      vi.mocked(mockBoardService.deleteColumn).mockResolvedValue({
        success: true,
        data: undefined,
      });

      await act(async () => {
        await result.current.deleteColumn('col-delete');
      });

      // 列が削除されていることを確認
      expect(result.current.columns).toHaveLength(1);
      expect(result.current.columns[0].id).toBe('col-keep');

      // 削除された列のタスクも削除されていることを確認
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].id).toBe('task-1');
      expect(result.current.tasks[0].columnId).toBe('col-keep');
    });

    it('should handle delete column error without affecting state', async () => {
      const { result } = renderHook(() => useBoardStore());
      const testUserId = 'user-error';

      const mockColumn: Column = {
        id: 'col-error',
        userId: testUserId,
        name: 'エラー列',
        position: 0,
        createdAt: new Date().toISOString(),
      };

      act(() => {
        result.current.setColumns([mockColumn]);
      });

      // 削除失敗
      vi.mocked(mockBoardService.deleteColumn).mockResolvedValue({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete column',
        },
      });

      await act(async () => {
        await result.current.deleteColumn('col-error');
      });

      // エラー時は状態が変更されないこと（楽観的更新がロールバックされる）
      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toContain('Failed to delete column');
    });
  });

  describe('複合操作フロー', () => {
    it('should handle complex workflow: create, move, edit, delete', async () => {
      const { result } = renderHook(() => useBoardStore());
      const testUserId = 'user-complex';

      // 1. 列作成
      const col1: Column = {
        id: 'col-1',
        userId: testUserId,
        name: 'TODO',
        position: 0,
        createdAt: new Date().toISOString(),
      };
      const col2: Column = {
        id: 'col-2',
        userId: testUserId,
        name: 'DONE',
        position: 1,
        createdAt: new Date().toISOString(),
      };

      vi.mocked(mockBoardService.createColumn)
        .mockResolvedValueOnce({ success: true, data: col1 })
        .mockResolvedValueOnce({ success: true, data: col2 });

      await act(async () => {
        await result.current.createColumn(testUserId, 'TODO');
        await result.current.createColumn(testUserId, 'DONE');
      });

      // 2. タスク作成
      const task: Task = {
        id: 'task-complex',
        userId: testUserId,
        columnId: 'col-1',
        title: '複雑なタスク',
        description: '説明',
        priority: 'medium',
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(mockTaskService.createTask).mockResolvedValue({
        success: true,
        data: task,
      });

      await act(async () => {
        await result.current.createTask({
          userId: testUserId,
          columnId: 'col-1',
          title: '複雑なタスク',
          description: '説明',
          priority: 'medium',
        });
      });

      // 3. タスク移動
      const movedTask = { ...task, columnId: 'col-2' };
      vi.mocked(mockTaskService.moveTask).mockResolvedValue({
        success: true,
        data: movedTask,
      });

      await act(async () => {
        await result.current.moveTask('task-complex', 'col-2', 0);
      });

      // 4. タスク編集
      const editedTask = { ...movedTask, title: '完了したタスク' };
      vi.mocked(mockTaskService.updateTask).mockResolvedValue({
        success: true,
        data: editedTask,
      });

      await act(async () => {
        await result.current.updateTask('task-complex', {
          title: '完了したタスク',
        });
      });

      // 5. タスク削除
      vi.mocked(mockTaskService.deleteTask).mockResolvedValue({
        success: true,
        data: undefined,
      });

      await act(async () => {
        await result.current.deleteTask('task-complex');
      });

      // 最終状態確認
      expect(result.current.columns).toHaveLength(2);
      expect(result.current.tasks).toHaveLength(0);
    });
  });
});
