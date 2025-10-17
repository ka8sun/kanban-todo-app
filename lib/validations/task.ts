import { z } from 'zod';

/**
 * タスク作成フォームのバリデーションスキーマ
 */
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは1文字以上必要です')
    .max(200, 'タイトルは200文字以内で入力してください'),
  description: z
    .string()
    .max(2000, '説明は2000文字以内で入力してください')
    .optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    message: '優先度を選択してください',
  }),
});

/**
 * タスク更新フォームのバリデーションスキーマ
 */
export const updateTaskSchema = createTaskSchema.partial();

/**
 * タスク作成フォームの型
 */
export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

/**
 * タスク更新フォームの型
 */
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;
