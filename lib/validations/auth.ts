import { z } from 'zod';

/**
 * サインアップフォームのバリデーションスキーマ
 */
export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, 'メールアドレスを入力してください')
      .email('有効なメールアドレスを入力してください'),
    password: z
      .string()
      .min(8, 'パスワードは8文字以上で入力してください')
      .max(100, 'パスワードは100文字以内で入力してください'),
    confirmPassword: z.string().min(1, 'パスワード（確認）を入力してください'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

/**
 * サインインフォームのバリデーションスキーマ
 */
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

/**
 * サインアップフォームの型
 */
export type SignUpFormData = z.infer<typeof signUpSchema>;

/**
 * サインインフォームの型
 */
export type SignInFormData = z.infer<typeof signInSchema>;
