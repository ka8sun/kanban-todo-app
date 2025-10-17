/**
 * 列作成モーダルコンポーネント (react-hook-form + zod版)
 * 新しい列を作成するためのダイアログ
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBoardStore } from '@/lib/store/useBoardStore';
import { createColumnSchema, type CreateColumnFormData } from '@/lib/validations/column';
import { showSuccessToast, showErrorToast } from '@/lib/toast/toast';

interface CreateColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function CreateColumnModalV2({
  open,
  onOpenChange,
  userId,
}: CreateColumnModalProps) {
  const { createColumn } = useBoardStore();

  const form = useForm<CreateColumnFormData>({
    resolver: zodResolver(createColumnSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (data: CreateColumnFormData) => {
    try {
      // createColumnは内部でposition値を計算する
      await createColumn(userId, data.name.trim());

      // 成功したらモーダルを閉じてフォームをリセット
      form.reset();
      onOpenChange(false);
      showSuccessToast('列を作成しました');
    } catch (error) {
      console.error('Failed to create column:', error);
      showErrorToast(
        `列の作成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
      );
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>新しい列を追加</DialogTitle>
              <DialogDescription>
                カンバンボードに新しい列を追加します。列名を入力してください。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>列名 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="例: 未着手、進行中、完了"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
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
