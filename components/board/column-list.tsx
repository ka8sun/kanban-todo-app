/**
 * カラムリストコンポーネント
 * 全てのカラムを表示
 *
 * パフォーマンス最適化:
 * - React.memoでコンポーネントをメモ化
 * - useMemoでタスク分類処理をメモ化
 * - 不要な再計算を防止
 */

'use client';

import { memo, useMemo } from 'react';
import type { Column, Task } from '@/lib/store/types';
import { ColumnCard } from './column-card';

interface ColumnListProps {
  columns: Column[];
  tasks: Task[];
  isDragging?: boolean;
}

export const ColumnList = memo(function ColumnList({
  columns,
  tasks,
  isDragging = false,
}: ColumnListProps) {
  // 列ごとにタスクを分類してソート（useMemoでメモ化）
  const tasksByColumn = useMemo(() => {
    const grouped = tasks.reduce<Record<string, Task[]>>((acc, task) => {
      const columnId = task.columnId;
      if (!acc[columnId]) {
        acc[columnId] = [];
      }
      acc[columnId]!.push(task);
      return acc;
    }, {});

    // 各列のタスクをposition順にソート
    Object.keys(grouped).forEach((columnId) => {
      const tasksInColumn = grouped[columnId];
      if (tasksInColumn) {
        tasksInColumn.sort((a, b) => a.position - b.position);
      }
    });

    return grouped;
  }, [tasks]);

  return (
    <>
      {columns.map((column) => (
        <ColumnCard
          key={column.id}
          column={column}
          tasks={tasksByColumn[column.id] || []}
          isDragging={isDragging}
        />
      ))}
    </>
  );
});
