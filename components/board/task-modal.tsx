/**
 * タスク詳細モーダルコンポーネント
 * タスクの詳細表示・編集・削除
 */

'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';
import { useBoardStore } from '@/lib/store/useBoardStore';
import type { Priority } from '@/lib/store/types';

interface TaskModalProps {
  taskId: string | null;
  onClose: () => void;
}

export function TaskModal({ taskId, onClose }: TaskModalProps) {
  const { tasks, updateTask, deleteTask } = useBoardStore();
  const task = tasks.find((t: { id: string }) => t.id === taskId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // タスクデータをフォームに反映
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
    }
  }, [task]);

  if (!task) {
    return null;
  }

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteTask(task.id);
      setShowDeleteDialog(false);
      onClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={!!taskId} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>タスクの編集</DialogTitle>
            <DialogDescription>
              タスクの詳細を編集します。変更内容は自動的に保存されます。
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* タイトル */}
            <div className="grid gap-2">
              <Label htmlFor="task-title">タイトル *</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タスクのタイトルを入力"
                required
              />
            </div>

            {/* 説明 */}
            <div className="grid gap-2">
              <Label htmlFor="task-description">説明</Label>
              <Textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="タスクの詳細説明を入力（任意）"
                rows={4}
              />
            </div>

            {/* 優先度 */}
            <div className="grid gap-2">
              <Label htmlFor="task-priority">優先度</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                <SelectTrigger id="task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 作成日時 */}
            <div className="text-sm text-gray-500">
              作成日時: {new Date(task.createdAt).toLocaleString('ja-JP')}
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isSubmitting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting || !title.trim()}
              >
                {isSubmitting ? '保存中...' : '保存'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>タスクを削除しますか?</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。タスク「{task.title}」が完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? '削除中...' : '削除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
