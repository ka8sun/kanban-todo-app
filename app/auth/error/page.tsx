/**
 * 認証エラーページ
 */

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'エラー | カンバンToDoアプリ',
  description: '認証エラーが発生しました',
};

interface ErrorPageProps {
  searchParams: Promise<{ message?: string }>;
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const params = await searchParams;
  const message = params.message || '不明なエラーが発生しました';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            カンバンToDoアプリ
          </h1>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-red-600">エラーが発生しました</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{message}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/auth/signin">ログインページに戻る</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
