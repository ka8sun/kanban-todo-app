import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBoardStore } from '../useBoardStore';
import { BoardService } from '../../services/BoardService';
import type { Column } from '../types';

// BoardServiceをモック
vi.mock('../../services/BoardService');

describe('useBoardStore - Board/Column管理', () => {
  let mockBoardService: any;

  beforeEach(() => {
    // ストアをリセット
    const { result } = renderHook(() => useBoardStore());
    act(() => {
      result.current.reset();
    });

    // モックBoardServiceの作成
    mockBoardService = {
      getBoard: vi.fn(),
      createColumn: vi.fn(),
      updateColumn: vi.fn(),
      deleteColumn: vi.fn(),
      reorderColumns: vi.fn(),
    };

    // BoardServiceのコンストラクタがモックインスタンスを返すように設定
    vi.mocked(BoardService).mockImplementation(() => mockBoardService);
  });

  describe('fetchBoard', () => {
    it('ボード取得に成功した場合、列が状態に保存される', async () => {
      const { result } = renderHook(() => useBoardStore());
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

      mockBoardService.getBoard.mockResolvedValue({
        success: true,
        data: {
          userId: 'user-1',
          columns: mockColumns,
        },
      });

      await act(async () => {
        await result.current.fetchBoard('user-1');
      });

      expect(result.current.columns).toEqual(mockColumns);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('ボード取得に失敗した場合、エラーが設定される', async () => {
      const { result } = renderHook(() => useBoardStore());
      const mockError = {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch board',
      };

      mockBoardService.getBoard.mockResolvedValue({
        success: false,
        error: mockError,
      });

      await act(async () => {
        await result.current.fetchBoard('user-1');
      });

      expect(result.current.columns).toEqual([]);
      expect(result.current.error).toEqual(mockError);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('createColumn', () => {
    it('列作成に成功した場合、楽観的に状態が更新される', async () => {
      const { result } = renderHook(() => useBoardStore());
      const mockColumn: Column = {
        id: 'col-new',
        userId: 'user-1',
        name: '完了',
        position: 2,
        createdAt: new Date().toISOString(),
      };

      mockBoardService.createColumn.mockResolvedValue({
        success: true,
        data: mockColumn,
      });

      await act(async () => {
        await result.current.createColumn('user-1', '完了');
      });

      expect(result.current.columns).toContainEqual(mockColumn);
      expect(result.current.error).toBe(null);
    });

    it('列作成に失敗した場合、エラーが設定され、楽観的更新がロールバックされる', async () => {
      const { result } = renderHook(() => useBoardStore());
      const mockError = {
        code: 'CREATE_ERROR',
        message: 'Failed to create column',
      };

      mockBoardService.createColumn.mockResolvedValue({
        success: false,
        error: mockError,
      });

      // 初期状態を保存
      const initialColumns = [...result.current.columns];

      await act(async () => {
        await result.current.createColumn('user-1', '完了');
      });

      // エラーが設定され、状態がロールバックされている
      expect(result.current.error).toEqual(mockError);
      expect(result.current.columns).toEqual(initialColumns);
    });
  });

  describe('updateColumn', () => {
    it('列更新に成功した場合、状態が更新される', async () => {
      const { result } = renderHook(() => useBoardStore());
      const initialColumn: Column = {
        id: 'col-1',
        userId: 'user-1',
        name: '未着手',
        position: 0,
        createdAt: new Date().toISOString(),
      };

      const updatedColumn: Column = {
        ...initialColumn,
        name: '未着手（更新）',
      };

      // 初期状態を設定
      act(() => {
        result.current.setColumns([initialColumn]);
      });

      mockBoardService.updateColumn.mockResolvedValue({
        success: true,
        data: updatedColumn,
      });

      await act(async () => {
        await result.current.updateColumn('col-1', { name: '未着手（更新）' });
      });

      expect(result.current.columns[0].name).toBe('未着手（更新）');
      expect(result.current.error).toBe(null);
    });

    it('列更新に失敗した場合、エラーが設定される', async () => {
      const { result } = renderHook(() => useBoardStore());
      const mockError = {
        code: 'UPDATE_ERROR',
        message: 'Failed to update column',
      };

      mockBoardService.updateColumn.mockResolvedValue({
        success: false,
        error: mockError,
      });

      await act(async () => {
        await result.current.updateColumn('col-1', { name: '未着手（更新）' });
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('deleteColumn', () => {
    it('列削除に成功した場合、状態から削除される', async () => {
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

      // 初期状態を設定
      act(() => {
        result.current.setColumns(columns);
      });

      mockBoardService.deleteColumn.mockResolvedValue({
        success: true,
        data: undefined,
      });

      await act(async () => {
        await result.current.deleteColumn('col-1');
      });

      expect(result.current.columns.length).toBe(1);
      expect(result.current.columns[0].id).toBe('col-2');
      expect(result.current.error).toBe(null);
    });

    it('列削除に失敗した場合、エラーが設定される', async () => {
      const { result } = renderHook(() => useBoardStore());
      const mockError = {
        code: 'DELETE_ERROR',
        message: 'Failed to delete column',
      };

      mockBoardService.deleteColumn.mockResolvedValue({
        success: false,
        error: mockError,
      });

      await act(async () => {
        await result.current.deleteColumn('col-1');
      });

      expect(result.current.error).toEqual(mockError);
    });
  });
});
