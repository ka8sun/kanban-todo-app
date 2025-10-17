import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BoardService } from '../BoardService';
import { createClientSupabase } from '../../supabase';
import type { Column } from '../../store/types';

// Supabaseクライアントをモック
vi.mock('../../supabase', () => ({
  createClientSupabase: vi.fn(),
}));

describe('BoardService', () => {
  let boardService: BoardService;
  let mockSupabaseClient: any;

  beforeEach(() => {
    // モックSupabaseクライアントの作成
    mockSupabaseClient = {
      from: vi.fn(),
      auth: {
        getUser: vi.fn(),
      },
    };

    // createClientSupabaseがモッククライアントを返すように設定
    vi.mocked(createClientSupabase).mockReturnValue(mockSupabaseClient);

    boardService = new BoardService();
  });

  describe('getBoard', () => {
    it('ユーザーのボード（列のリスト）を取得できる', async () => {
      const mockColumns: Column[] = [
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

      // データベースからはスネークケースで返される
      const dbColumns = mockColumns.map((col) => ({
        id: col.id,
        user_id: col.userId,
        name: col.name,
        position: col.position,
        created_at: col.createdAt,
        updated_at: col.createdAt,
      }));

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: dbColumns,
              error: null,
            }),
          }),
        }),
      });

      const result = await boardService.getBoard('user-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe('user-1');
        expect(result.data.columns).toEqual(mockColumns);
      }
    });

    it('データベースエラー時にエラーを返す', async () => {
      const mockError = {
        message: 'Database error',
        code: 'DB_ERROR',
      };

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await boardService.getBoard('user-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Database error');
      }
    });
  });

  describe('createColumn', () => {
    it('新しい列を作成できる', async () => {
      const mockColumn: Column = {
        id: 'col-new',
        userId: 'user-1',
        name: '完了',
        position: 2,
        createdAt: new Date().toISOString(),
      };

      // データベースからはスネークケースで返される
      const dbColumn = {
        id: mockColumn.id,
        user_id: mockColumn.userId,
        name: mockColumn.name,
        position: mockColumn.position,
        created_at: mockColumn.createdAt,
        updated_at: mockColumn.createdAt,
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

      const result = await boardService.createColumn('user-1', '完了', 2);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('完了');
        expect(result.data.position).toBe(2);
      }
    });

    it('データベースエラー時にエラーを返す', async () => {
      const mockError = {
        message: 'Insert failed',
        code: 'INSERT_ERROR',
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await boardService.createColumn('user-1', '完了', 2);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Insert failed');
      }
    });
  });

  describe('updateColumn', () => {
    it('列を更新できる', async () => {
      const mockColumn: Column = {
        id: 'col-1',
        userId: 'user-1',
        name: '進行中（更新）',
        position: 1,
        createdAt: new Date().toISOString(),
      };

      // データベースからはスネークケースで返される
      const dbColumn = {
        id: mockColumn.id,
        user_id: mockColumn.userId,
        name: mockColumn.name,
        position: mockColumn.position,
        created_at: mockColumn.createdAt,
        updated_at: mockColumn.createdAt,
      };

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: dbColumn,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await boardService.updateColumn('col-1', {
        name: '進行中（更新）',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('進行中（更新）');
      }
    });

    it('データベースエラー時にエラーを返す', async () => {
      const mockError = {
        message: 'Update failed',
        code: 'UPDATE_ERROR',
      };

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: mockError,
              }),
            }),
          }),
        }),
      });

      const result = await boardService.updateColumn('col-1', {
        name: '進行中（更新）',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Update failed');
      }
    });
  });

  describe('deleteColumn', () => {
    it('列を削除できる', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      const result = await boardService.deleteColumn('col-1');

      expect(result.success).toBe(true);
    });

    it('データベースエラー時にエラーを返す', async () => {
      const mockError = {
        message: 'Delete failed',
        code: 'DELETE_ERROR',
      };

      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      });

      const result = await boardService.deleteColumn('col-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Delete failed');
      }
    });
  });

  describe('reorderColumns', () => {
    it('列の並び順を更新できる', async () => {
      const mockColumns: Column[] = [
        {
          id: 'col-2',
          userId: 'user-1',
          name: '進行中',
          position: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'col-1',
          userId: 'user-1',
          name: '未着手',
          position: 1,
          createdAt: new Date().toISOString(),
        },
      ];

      // データベースからはスネークケースで返される
      const dbColumns = mockColumns.map((col) => ({
        id: col.id,
        user_id: col.userId,
        name: col.name,
        position: col.position,
        created_at: col.createdAt,
        updated_at: col.createdAt,
      }));

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: dbColumns,
              error: null,
            }),
          }),
        }),
      });

      const result = await boardService.reorderColumns('user-1', [
        'col-2',
        'col-1',
      ]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockColumns);
      }
    });

    it('データベースエラー時にエラーを返す', async () => {
      const mockError = {
        message: 'Reorder failed',
        code: 'REORDER_ERROR',
      };

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      });

      const result = await boardService.reorderColumns('user-1', [
        'col-2',
        'col-1',
      ]);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Reorder failed');
      }
    });
  });
});
