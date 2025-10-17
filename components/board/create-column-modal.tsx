/**
 * 列作成モーダルコンポーネント
 * 新しい列を作成するためのダイアログ
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBoardStore } from '@/lib/store/useBoardStore';

interface CreateColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function CreateColumnModal({
  open,
  onOpenChange,
  userId,
}: CreateColumnModalProps) {
  const [columnName, setColumnName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createColumn } = useBoardStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!columnName.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // createColumnは内部でposition値を計算する
      await createColumn(userId, columnName.trim());

      // 成功したらモーダルを閉じてフォームをリセット
      setColumnName('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create column:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setColumnName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>新しい列を追加</DialogTitle>
            <DialogDescription>
              カンバンボードに新しい列を追加します。列名を入力してください。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="column-name">列名</Label>
              <Input
                id="column-name"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                placeholder="例: 未着手、進行中、完了"
                autoFocus
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting || !columnName.trim()}>
              {isSubmitting ? '作成中...' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
