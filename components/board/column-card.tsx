/**
 * カラムカードコンポーネント
 * 1つの列を表示し、編集・削除機能を提供
 */

'use client';

import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit2, Trash2, Plus } from 'lucide-react';
import type { Column, Task } from '@/lib/store/types';
import { useBoardStore } from '@/lib/store/useBoardStore';
import { TaskCard } from './task-card';
import { CreateTaskModal } from './create-task-modal';

interface ColumnCardProps {
  column: Column;
  tasks: Task[];
  isDragging?: boolean;
}

export function ColumnCard({ column, tasks, isDragging: _isDragging = false }: ColumnCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(column.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const { updateColumn, deleteColumn } = useBoardStore();

  const handleSaveEdit = async () => {
    if (editedName.trim() && editedName !== column.name) {
      await updateColumn(column.id, { name: editedName.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditedName(column.name);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    await deleteColumn(column.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="w-full md:w-80 flex-shrink-0 transition-shadow hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            {isEditing ? (
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={handleKeyDown}
                autoFocus
                className="font-semibold"
              />
            ) : (
              <CardTitle className="text-lg truncate max-w-[200px]">{column.name}</CardTitle>
            )}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                disabled={isEditing}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Droppable droppableId={column.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-2 min-h-[100px] ${
                  snapshot.isDraggingOver ? 'bg-blue-50 rounded-md' : ''
                }`}
              >
                {tasks.map((task, index) => (
                  <TaskCard key={task.id} task={task} index={index} />
                ))}
                {provided.placeholder}
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => setShowCreateTaskModal(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  タスクを追加
                </Button>
              </div>
            )}
          </Droppable>
        </CardContent>
      </Card>

      {/* タスク作成モーダル */}
      <CreateTaskModal
        open={showCreateTaskModal}
        onOpenChange={setShowCreateTaskModal}
        userId={column.userId}
        columnId={column.id}
      />

      {/* 削除確認ダイアログ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>列を削除しますか?</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。列内の全てのタスクも削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
