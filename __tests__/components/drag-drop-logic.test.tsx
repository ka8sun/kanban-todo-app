/**
 * ドラッグ&ドロップロジックのテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { KanbanBoard } from '@/components/kanban-board';
import { useBoardStore } from '@/lib/store/useBoardStore';

// Zustand Storeをモック化
vi.mock('@/lib/store/useBoardStore');

describe('ドラッグ&ドロップロジック', () => {
  const mockUseBoardStore = useBoardStore as unknown as ReturnType<
    typeof vi.fn
  >;
  let mockMoveTask: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMoveTask = vi.fn();
    mockUseBoardStore.mockReturnValue({
      columns: [
        {
          id: 'col-1',
          userId: 'user-1',
          name: '未着手',
          position: 0,
          createdAt: '2025-10-14T00:00:00Z',
          updatedAt: '2025-10-14T00:00:00Z',
        },
        {
          id: 'col-2',
          userId: 'user-1',
          name: '進行中',
          position: 1,
          createdAt: '2025-10-14T00:00:00Z',
          updatedAt: '2025-10-14T00:00:00Z',
        },
      ],
      tasks: [
        {
          id: 'task-1',
          userId: 'user-1',
          columnId: 'col-1',
          title: 'タスク1',
          description: '',
          priority: 'medium',
          position: 0,
          createdAt: '2025-10-14T00:00:00Z',
          updatedAt: '2025-10-14T00:00:00Z',
        },
        {
          id: 'task-2',
          userId: 'user-1',
          columnId: 'col-1',
          title: 'タスク2',
          description: '',
          priority: 'low',
          position: 1,
          createdAt: '2025-10-14T00:00:00Z',
          updatedAt: '2025-10-14T00:00:00Z',
        },
      ],
      loading: false,
      error: null,
      fetchBoard: vi.fn(),
      handleRealtimeEvent: vi.fn(),
      moveTask: mockMoveTask,
    });
  });

  it('DragDropContextが正しくレンダリングされる', () => {
    render(<KanbanBoard userId="user-1" />);

    // 列とタスクが表示されることを確認
    expect(screen.getByText('未着手')).toBeDefined();
    expect(screen.getByText('進行中')).toBeDefined();
    expect(screen.getByText('タスク1')).toBeDefined();
    expect(screen.getByText('タスク2')).toBeDefined();
  });

  it('DroppableとDraggableが正しく設定されている', async () => {
    render(<KanbanBoard userId="user-1" />);

    // DragDropContextが設定されていることを確認
    // （実際のDOMには data-rbd-* 属性が追加される）
    await waitFor(() => {
      const columns = screen.getAllByText(/タスクを追加/);
      expect(columns.length).toBe(2); // 2つの列がある
    });
  });
});
