import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskService } from '../TaskService';
import { createClientSupabase } from '../../supabase';
import type { Task } from '../../store/types';

// Supabaseクライアントをモック
vi.mock('../../supabase', () => ({
  createClientSupabase: vi.fn(),
}));

describe('TaskService', () => {
  let taskService: TaskService;
  let mockSupabaseClient: any;

  beforeEach(() => {
    // モックSupabaseクライアントの作成
    mockSupabaseClient = {
      from: vi.fn(),
    };

    // createClientSupabaseがモッククライアントを返すように設定
    vi.mocked(createClientSupabase).mockReturnValue(mockSupabaseClient);

    taskService = new TaskService();
  });

  describe('getTasks', () => {
    it('ユーザーのタスクを取得できる', async () => {
      const mockTasks: Task[] = [
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

      // データベースからはスネークケースで返される
      const dbTasks = mockTasks.map((task) => ({
        id: task.id,
        user_id: task.userId,
        column_id: task.columnId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        position: task.position,
        created_at: task.createdAt,
        updated_at: task.updatedAt,
      }));

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: dbTasks,
              error: null,
            }),
          }),
        }),
      });

      const result = await taskService.getTasks('user-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockTasks);
      }
    });

    it('検索クエリでフィルタリングできる', async () => {
      const mockTasks: Task[] = [
        {
          id: 'task-1',
          userId: 'user-1',
          columnId: 'col-1',
          title: 'バグ修正',
          description: 'テスト用タスク',
          priority: 'high',
          position: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const dbTasks = mockTasks.map((task) => ({
        id: task.id,
        user_id: task.userId,
        column_id: task.columnId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        position: task.position,
        created_at: task.createdAt,
        updated_at: task.updatedAt,
      }));

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: dbTasks,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await taskService.getTasks('user-1', {
        searchQuery: 'バグ',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockTasks);
      }
    });

    it('優先度でフィルタリングできる', async () => {
      const mockTasks: Task[] = [
        {
          id: 'task-1',
          userId: 'user-1',
          columnId: 'col-1',
          title: '緊急タスク',
          description: null,
          priority: 'high',
          position: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const dbTasks = mockTasks.map((task) => ({
        id: task.id,
        user_id: task.userId,
        column_id: task.columnId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        position: task.position,
        created_at: task.createdAt,
        updated_at: task.updatedAt,
      }));

      // 優先度フィルターの場合は eq が2回呼ばれる（user_id と priority）
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: dbTasks,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await taskService.getTasks('user-1', {
        priority: 'high',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockTasks);
      }
    });
  });

  describe('createTask', () => {
    it('新しいタスクを作成できる', async () => {
      const mockTask: Task = {
        id: 'task-new',
        userId: 'user-1',
        columnId: 'col-1',
        title: '新しいタスク',
        description: 'テスト用',
        priority: 'medium',
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const dbTask = {
        id: mockTask.id,
        user_id: mockTask.userId,
        column_id: mockTask.columnId,
        title: mockTask.title,
        description: mockTask.description,
        priority: mockTask.priority,
        position: mockTask.position,
        created_at: mockTask.createdAt,
        updated_at: mockTask.updatedAt,
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: dbTask,
              error: null,
            }),
          }),
        }),
      });

      const result = await taskService.createTask({
        userId: 'user-1',
        columnId: 'col-1',
        title: '新しいタスク',
        description: 'テスト用',
        priority: 'medium',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('新しいタスク');
      }
    });
  });

  describe('updateTask', () => {
    it('タスクを更新できる', async () => {
      const mockTask: Task = {
        id: 'task-1',
        userId: 'user-1',
        columnId: 'col-1',
        title: '更新されたタスク',
        description: 'テスト用',
        priority: 'high',
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const dbTask = {
        id: mockTask.id,
        user_id: mockTask.userId,
        column_id: mockTask.columnId,
        title: mockTask.title,
        description: mockTask.description,
        priority: mockTask.priority,
        position: mockTask.position,
        created_at: mockTask.createdAt,
        updated_at: mockTask.updatedAt,
      };

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: dbTask,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await taskService.updateTask('task-1', {
        title: '更新されたタスク',
        priority: 'high',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('更新されたタスク');
        expect(result.data.priority).toBe('high');
      }
    });
  });

  describe('deleteTask', () => {
    it('タスクを削除できる', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      const result = await taskService.deleteTask('task-1');

      expect(result.success).toBe(true);
    });
  });

  describe('moveTask', () => {
    it('タスクを別の列に移動できる', async () => {
      const mockTask: Task = {
        id: 'task-1',
        userId: 'user-1',
        columnId: 'col-2',
        title: '移動されたタスク',
        description: null,
        priority: 'medium',
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const dbTask = {
        id: mockTask.id,
        user_id: mockTask.userId,
        column_id: mockTask.columnId,
        title: mockTask.title,
        description: mockTask.description,
        priority: mockTask.priority,
        position: mockTask.position,
        created_at: mockTask.createdAt,
        updated_at: mockTask.updatedAt,
      };

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: dbTask,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await taskService.moveTask('task-1', 'col-2', 0);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.columnId).toBe('col-2');
        expect(result.data.position).toBe(0);
      }
    });
  });
});
