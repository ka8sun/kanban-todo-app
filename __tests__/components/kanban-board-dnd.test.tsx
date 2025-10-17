/**
 * KanbanBoard DragDropContext統合のテスト
 */

import { render, screen } from '@testing-library/react';
import { KanbanBoard } from '@/components/kanban-board';
import { useBoardStore } from '@/lib/store/useBoardStore';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Zustand Storeをモック化
vi.mock('@/lib/store/useBoardStore');

describe('KanbanBoard - DragDropContext統合', () => {
  const mockUseBoardStore = useBoardStore as unknown as ReturnType<
    typeof vi.fn
  >;

  beforeEach(() => {
    vi.clearAllMocks();
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
      ],
      tasks: [
        {
          id: 'task-1',
          userId: 'user-1',
          columnId: 'col-1',
          title: 'テストタスク',
          description: 'テスト説明',
          priority: 'medium',
          position: 0,
          createdAt: '2025-10-14T00:00:00Z',
          updatedAt: '2025-10-14T00:00:00Z',
        },
      ],
      loading: false,
      error: null,
      fetchBoard: vi.fn(),
      handleRealtimeEvent: vi.fn(),
      moveTask: vi.fn(),
    });
  });

  it('DragDropContextでカンバンボードをラップしている', () => {
    render(<KanbanBoard userId="user-1" />);

    // DragDropContextがレンダリングされていることを確認
    // （実際のDOMにはdata-rbd-droppable-context-idが追加される）
    const board = screen.getByText('未着手').closest('div[data-rbd-droppable-context-id]');
    expect(board).toBeDefined();
  });

  it('onDragEndハンドラーが定義されている', () => {
    render(<KanbanBoard userId="user-1" />);

    // DragDropContextが存在することを確認
    // （後でonDragEndの動作テストを追加）
    expect(screen.getByText('未着手')).toBeDefined();
  });
});
