/**
 * サインインフォームコンポーネント
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

/**
 * フォームエラー
 */
interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

/**
 * サインインフォームのプロパティ
 */
interface SignInFormProps {
  /** ログイン後のリダイレクト先 */
  redirectTo?: string;
  /** 表示するメッセージ */
  message?: string;
}

/**
 * サインインフォーム
 */
export function SignInForm({ message }: SignInFormProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * フォームバリデーション
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // メールアドレスのバリデーション
    if (!email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    }

    // パスワードのバリデーション
    if (!password) {
      newErrors.password = 'パスワードを入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * フォーム送信ハンドラー
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await signIn({ email, password });
      // 成功時はAuthContextがリダイレクトを処理
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : 'ログインに失敗しました。メールアドレスとパスワードを確認してください。',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>ログイン</CardTitle>
        <CardDescription>
          メールアドレスとパスワードを入力してログインしてください
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* 成功メッセージ */}
          {message && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
              {message}
            </div>
          )}

          {/* 全体エラーメッセージ */}
          {errors.general && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {errors.general}
            </div>
          )}

          {/* メールアドレス */}
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* パスワード */}
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </Button>
          <p className="text-center text-sm text-gray-600">
            アカウントをお持ちでない方は{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-blue-600 hover:underline"
            >
              新規登録
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
