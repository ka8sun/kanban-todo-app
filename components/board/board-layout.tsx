/**
 * ボードレイアウトコンポーネント
 * ヘッダー、ログアウトボタン、将来的なカンバンボードを含む
 */

'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import type { AuthSession } from '@/lib/auth';
import { useState } from 'react';
import { showErrorToast } from '@/lib/toast';

/**
 * ボードレイアウトのプロパティ
 */
interface BoardLayoutProps {
  session: AuthSession;
}

/**
 * ボードレイアウト
 */
export function BoardLayout({ session }: BoardLayoutProps) {
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * ログアウトハンドラー
   */
  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
      showErrorToast('ログアウトに失敗しました。もう一度お試しください。');
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="flex min-h-screen flex-col">
        {/* ヘッダー */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* ロゴ */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              カンバンToDoアプリ
            </h1>
          </div>

          {/* ユーザー情報とログアウトボタン */}
          <div className="flex items-center space-x-4">
            <div className="hidden text-sm text-gray-700 sm:block">
              <span className="font-medium">{session.user.email}</span>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* プレースホルダー: 将来的にカンバンボードを配置 */}
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              カンバンボード
            </h2>
            <p className="mt-2 text-gray-600">
              ようこそ、{session.user.email} さん！
            </p>
            <p className="mt-1 text-sm text-gray-500">
              カンバンボードの実装は次のタスクで行います
            </p>
          </div>
        </div>
      </main>
      </div>
    </>
  );
}
