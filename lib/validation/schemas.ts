import { z } from 'zod';

/**
 * バリデーションスキーマ定義
 *
 * Zodを使用してフォームバリデーションスキーマを定義します。
 */

/**
 * メールアドレスバリデーションスキーマ
 */
export const emailSchema = z
  .string()
  .min(1, 'メールアドレスは必須です')
  .email('有効なメールアドレスを入力してください');

/**
 * パスワードバリデーションスキーマ
 */
export const passwordSchema = z
  .string()
  .min(8, 'パスワードは8文字以上である必要があります')
  .max(100, 'パスワードは100文字以下である必要があります');

/**
 * サインアップフォームバリデーションスキーマ
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * サインインフォームバリデーションスキーマ
 */
export const signinSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'パスワードは必須です'),
});

/**
 * タスクタイトルバリデーションスキーマ
 */
export const taskTitleSchema = z
  .string()
  .min(1, 'タスクのタイトルは必須です')
  .max(200, 'タスクのタイトルは200文字以下である必要があります');

/**
 * タスク説明バリデーションスキーマ
 */
export const taskDescriptionSchema = z
  .string()
  .max(2000, 'タスクの説明は2000文字以下である必要があります')
  .optional();

/**
 * 優先度バリデーションスキーマ
 */
export const prioritySchema = z.enum(['low', 'medium', 'high'], {
  message: '優先度は low, medium, high のいずれかである必要があります',
});

/**
 * タスク作成フォームバリデーションスキーマ
 */
export const createTaskSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  priority: prioritySchema,
});

/**
 * タスク更新フォームバリデーションスキーマ
 */
export const updateTaskSchema = z.object({
  title: taskTitleSchema.optional(),
  description: taskDescriptionSchema,
  priority: prioritySchema.optional(),
});

/**
 * 列名バリデーションスキーマ
 */
export const columnNameSchema = z
  .string()
  .min(1, '列名は必須です')
  .max(100, '列名は100文字以下である必要があります');

/**
 * 列作成フォームバリデーションスキーマ
 */
export const createColumnSchema = z.object({
  name: columnNameSchema,
});

/**
 * 列更新フォームバリデーションスキーマ
 */
export const updateColumnSchema = z.object({
  name: columnNameSchema.optional(),
});

// 型エクスポート
export type SignupFormData = z.infer<typeof signupSchema>;
export type SigninFormData = z.infer<typeof signinSchema>;
export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;
export type CreateColumnFormData = z.infer<typeof createColumnSchema>;
export type UpdateColumnFormData = z.infer<typeof updateColumnSchema>;
