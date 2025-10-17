/**
 * サインインページ
 */

import { SignInForm } from '@/components/auth/signin-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ログイン | カンバンToDoアプリ',
  description: 'カンバンToDoアプリにログインしてタスク管理を始めましょう',
};

interface SignInPageProps {
  searchParams: Promise<{ redirect?: string; message?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirect;
  const message = params.message;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            カンバンToDoアプリ
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            タスク管理をもっとシンプルに
          </p>
        </div>
        <SignInForm redirectTo={redirectTo} message={message} />
      </div>
    </div>
  );
}
