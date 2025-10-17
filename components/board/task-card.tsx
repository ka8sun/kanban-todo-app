/**
 * タスクカードコンポーネント
 * 個別タスクの表示、ドラッグハンドルの提供、クリックでモーダル開閉
 *
 * パフォーマンス最適化:
 * - React.memoでコンポーネントをメモ化
 * - useCallbackでイベントハンドラーをメモ化
 * - 日付フォーマットをメモ化
 */

'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/lib/store/types';
import { TaskModal } from './task-modal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TaskCardProps {
  task: Task;
  index: number;
}

const priorityLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-red-100 text-red-800',
};

export const TaskCard = memo(function TaskCard({ task, index }: TaskCardProps) {
  const [showModal, setShowModal] = useState(false);

  // イベントハンドラーをuseCallbackでメモ化
  const handleOpenModal = useCallback(() => setShowModal(true), []);
  const handleCloseModal = useCallback(() => setShowModal(false), []);

  // 日付フォーマットをメモ化
  const formattedDate = useMemo(
    () => new Date(task.createdAt).toLocaleDateString('ja-JP'),
    [task.createdAt]
  );

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <Card
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      snapshot.isDragging ? 'opacity-50 rotate-2' : ''
                    }`}
                    onClick={handleOpenModal}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm truncate flex-1">{task.title}</h3>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${priorityColors[task.priority]}`}
                          >
                            {priorityLabels[task.priority]}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="text-xs text-gray-400">{formattedDate}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>クリックして詳細を表示 | ドラッグして移動</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Draggable>

      <TaskModal taskId={showModal ? task.id : null} onClose={handleCloseModal} />
    </>
  );
});
