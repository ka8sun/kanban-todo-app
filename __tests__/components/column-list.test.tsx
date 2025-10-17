import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ColumnList } from '@/components/board/column-list';
import type { Column, Task } from '@/lib/store/types';

describe('ColumnList', () => {
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

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      userId: 'user-1',
      columnId: 'col-1',
      title: 'テストタスク1',
      description: '説明1',
      priority: 'high',
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it('should render all columns', () => {
    render(<ColumnList columns={mockColumns} tasks={mockTasks} />);

    expect(screen.getByText('未着手')).toBeInTheDocument();
    expect(screen.getByText('進行中')).toBeInTheDocument();
  });

  it('should render tasks in their respective columns', () => {
    render(<ColumnList columns={mockColumns} tasks={mockTasks} />);

    expect(screen.getByText('テストタスク1')).toBeInTheDocument();
  });

  it('should render "タスクを追加" button for each column', () => {
    render(<ColumnList columns={mockColumns} tasks={mockTasks} />);

    const addButtons = screen.getAllByText(/タスクを追加/i);
    expect(addButtons).toHaveLength(mockColumns.length);
  });
});
