/**
 * サインインフォームコンポーネント (react-hook-form + zod版)
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { signInSchema, type SignInFormData } from '@/lib/validations/auth';

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
export function SignInFormV2({ message }: SignInFormProps) {
  const { signIn } = useAuth();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setGeneralError(null);

    try {
      await signIn({ email: data.email, password: data.password });
      // 成功時はAuthContextがリダイレクトを処理
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : 'ログインに失敗しました。メールアドレスとパスワードを確認してください。'
      );
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* 成功メッセージ */}
            {message && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {/* 全体エラーメッセージ */}
            {generalError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{generalError}</AlertDescription>
              </Alert>
            )}

            {/* メールアドレス */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メールアドレス</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@example.com"
                      autoComplete="email"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* パスワード */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>パスワード</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="パスワード"
                      autoComplete="current-password"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'ログイン中...' : 'ログイン'}
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
      </Form>
    </Card>
  );
}
