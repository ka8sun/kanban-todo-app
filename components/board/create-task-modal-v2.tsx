/**
 * タスク作成モーダルコンポーネント (react-hook-form + zod版)
 * 新しいタスクを作成するためのダイアログ
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBoardStore } from '@/lib/store/useBoardStore';
import { createTaskSchema, type CreateTaskFormData } from '@/lib/validations/task';
import { showSuccessToast, showErrorToast } from '@/lib/toast/toast';

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  columnId: string;
}

export function CreateTaskModalV2({
  open,
  onOpenChange,
  userId,
  columnId,
}: CreateTaskModalProps) {
  const { createTask } = useBoardStore();

  const form = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
    },
  });

  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      await createTask({
        userId,
        columnId,
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        priority: data.priority,
      });

      // 成功したらモーダルを閉じてフォームをリセット
      form.reset();
      onOpenChange(false);
      showSuccessToast('タスクを作成しました');
    } catch (error) {
      console.error('Failed to create task:', error);
      showErrorToast(
        `タスクの作成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
      );
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>新しいタスクを追加</DialogTitle>
              <DialogDescription>タスクの情報を入力してください。</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* タイトル */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タイトル *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="タスクのタイトルを入力"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 説明 */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>説明</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="タスクの詳細説明を入力（任意）"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 優先度 */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>優先度</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">低</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="high">高</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={form.formState.isSubmitting}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || !form.formState.isValid}
              >
                {form.formState.isSubmitting ? '作成中...' : '作成'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
