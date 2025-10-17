import { z } from 'zod';

/**
 * 列作成フォームのバリデーションスキーマ
 */
export const createColumnSchema = z.object({
  name: z
    .string()
    .min(1, '列名は1文字以上必要です')
    .max(100, '列名は100文字以内で入力してください'),
});

/**
 * 列更新フォームのバリデーションスキーマ
 */
export const updateColumnSchema = createColumnSchema.partial();

/**
 * 列作成フォームの型
 */
export type CreateColumnFormData = z.infer<typeof createColumnSchema>;

/**
 * 列更新フォームの型
 */
export type UpdateColumnFormData = z.infer<typeof updateColumnSchema>;
