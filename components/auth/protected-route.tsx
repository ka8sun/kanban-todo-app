/**
 * 保護されたルートコンポーネント
 * クライアントサイドで認証チェックを行い、未認証の場合はリダイレクト
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth';

/**
 * 保護されたルートのプロパティ
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  /** リダイレクト先（デフォルト: /auth/signin） */
  redirectTo?: string;
  /** ローディングコンポーネント */
  loadingComponent?: React.ReactNode;
}

/**
 * 保護されたルート
 *
 * 認証が必要なページをラップするコンポーネント
 * セッションがない場合は自動的にログインページにリダイレクトします
 */
export function ProtectedRoute({
  children,
  redirectTo = '/auth/signin',
  loadingComponent,
}: ProtectedRouteProps) {
  const { session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    // ローディング中は何もしない
    if (loading) return;

    // セッションがない場合はリダイレクト
    if (!session) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
    }
  }, [session, loading, router, redirectTo]);

  // ローディング中
  if (loading) {
    return (
      loadingComponent || (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">認証確認中...</p>
          </div>
        </div>
      )
    );
  }

  // 未認証の場合は何も表示しない（リダイレクト中）
  if (!session) {
    return null;
  }

  // 認証済みの場合はコンテンツを表示
  return <>{children}</>;
}
