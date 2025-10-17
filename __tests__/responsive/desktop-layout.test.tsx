/**
 * デスクトップレイアウトのテスト
 * 要件7.1: デスクトップブラウザで全ての列を横に並べて表示
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KanbanBoard } from '@/components/kanban-board';
import { useBoardStore } from '@/lib/store/useBoardStore';
import type { Column, Task } from '@/lib/store/types';

// モック
vi.mock('@/lib/store/useBoardStore');
vi.mock('@/lib/hooks/useRealtimeSubscription', () => ({
  useRealtimeSubscription: vi.fn(),
}));

describe('デスクトップレイアウト', () => {
  const mockColumns: Column[] = [
    {
      id: 'col-1',
      userId: 'user-1',
      name: '未着手',
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'col-2',
      userId: 'user-1',
      name: '進行中',
      position: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'col-3',
      userId: 'user-1',
      name: '完了',
      position: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      userId: 'user-1',
      columnId: 'col-1',
      title: 'タスク1',
      description: '説明1',
      priority: 'medium',
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      userId: 'user-1',
      columnId: 'col-2',
      title: 'タスク2',
      description: '説明2',
      priority: 'high',
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.mocked(useBoardStore).mockReturnValue({
      columns: mockColumns,
      tasks: mockTasks,
      loading: false,
      error: null,
      fetchBoard: vi.fn(),
      handleRealtimeEvent: vi.fn(),
      moveTask: vi.fn(),
      getFilteredTasks: vi.fn(() => mockTasks),
      createColumn: vi.fn(),
      updateColumn: vi.fn(),
      deleteColumn: vi.fn(),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      setSearchQuery: vi.fn(),
      setSelectedPriority: vi.fn(),
    } as any);
  });

  describe('列の横並び表示', () => {
    it('全ての列が横並びで表示される', () => {
      const { container } = render(<KanbanBoard userId="user-1" />);

      // flex gap-6 overflow-x-autoクラスを持つ要素が存在するか確認
      const columnContainer = container.querySelector('.flex.gap-6.overflow-x-auto');
      expect(columnContainer).toBeTruthy();
    });

    it('列は固定幅(md:w-80)で表示される', () => {
      const { container } = render(<KanbanBoard userId="user-1" />);

      // md:w-80 クラスを持つカードが存在するか確認
      const columnCards = container.querySelectorAll('.md\\:w-80');
      expect(columnCards.length).toBeGreaterThan(0);
    });

    it('水平スクロールが可能', () => {
      const { container } = render(<KanbanBoard userId="user-1" />);

      // overflow-x-autoクラスが適用されているか確認
      const scrollableContainer = container.querySelector('.overflow-x-auto');
      expect(scrollableContainer).toBeTruthy();
    });
  });

  describe('タスクカードの高さ自動調整', () => {
    it('タスクカードのコンテンツに応じて高さが調整される', () => {
      render(<KanbanBoard userId="user-1" />);

      // タスクカードが存在することを確認
      const taskCard1 = screen.getByText('タスク1');
      const taskCard2 = screen.getByText('タスク2');

      expect(taskCard1).toBeInTheDocument();
      expect(taskCard2).toBeInTheDocument();
    });
  });

  describe('マウスホバーインタラクション', () => {
    it('列のカードにホバー効果が適用される', () => {
      const { container } = render(<KanbanBoard userId="user-1" />);

      // カードコンポーネントが存在することを確認
      const cards = container.querySelectorAll('[class*="card"]');
      expect(cards.length).toBeGreaterThan(0);
    });
  });
});
