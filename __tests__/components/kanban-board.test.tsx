import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KanbanBoard } from '@/components/kanban-board';

// Mock Zustand store
vi.mock('@/lib/stores/board-store', () => ({
  useBoardStore: vi.fn(),
}));

// Mock RealtimeService
vi.mock('@/lib/services/realtime-service', () => ({
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
}));

describe('KanbanBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display columns from store', () => {
    const { useBoardStore } = require('@/lib/stores/board-store');

    useBoardStore.mockReturnValue({
      columns: [
        { id: 'col-1', userId: 'user-1', name: '未着手', position: 0, createdAt: new Date().toISOString() },
        { id: 'col-2', userId: 'user-1', name: '進行中', position: 1, createdAt: new Date().toISOString() },
        { id: 'col-3', userId: 'user-1', name: '完了', position: 2, createdAt: new Date().toISOString() },
      ],
      tasks: [],
      loading: false,
      error: null,
      fetchBoard: vi.fn(),
      handleRealtimeEvent: vi.fn(),
    });

    render(<KanbanBoard userId="user-1" />);

    expect(screen.getByText('未着手')).toBeInTheDocument();
    expect(screen.getByText('進行中')).toBeInTheDocument();
    expect(screen.getByText('完了')).toBeInTheDocument();
  });

  it('should show loading state when loading', () => {
    const { useBoardStore } = require('@/lib/stores/board-store');

    useBoardStore.mockReturnValue({
      columns: [],
      tasks: [],
      loading: true,
      error: null,
      fetchBoard: vi.fn(),
      handleRealtimeEvent: vi.fn(),
    });

    render(<KanbanBoard userId="user-1" />);

    expect(screen.getByText(/読み込み中/i)).toBeInTheDocument();
  });

  it('should show error message when error occurs', () => {
    const { useBoardStore } = require('@/lib/stores/board-store');

    useBoardStore.mockReturnValue({
      columns: [],
      tasks: [],
      loading: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch board',
      },
      fetchBoard: vi.fn(),
      handleRealtimeEvent: vi.fn(),
    });

    render(<KanbanBoard userId="user-1" />);

    expect(screen.getByText(/Failed to fetch board/i)).toBeInTheDocument();
  });

  it('should fetch board on mount', () => {
    const { useBoardStore } = require('@/lib/stores/board-store');
    const mockFetchBoard = vi.fn();

    useBoardStore.mockReturnValue({
      columns: [],
      tasks: [],
      loading: false,
      error: null,
      fetchBoard: mockFetchBoard,
      handleRealtimeEvent: vi.fn(),
    });

    render(<KanbanBoard userId="user-1" />);

    expect(mockFetchBoard).toHaveBeenCalledWith('user-1');
  });
});
