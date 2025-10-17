/**
 * サインアップページ
 */

import { SignUpForm } from '@/components/auth/signup-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'アカウント作成 | カンバンToDoアプリ',
  description: '新しいアカウントを作成してカンバンToDoアプリを始めましょう',
};

export default function SignUpPage() {
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
        <SignUpForm />
      </div>
    </div>
  );
}
