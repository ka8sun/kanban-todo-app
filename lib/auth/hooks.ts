/**
 * クライアントサイド認証フック
 */

'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import type { AuthSession } from './types';
import { toAuthSession } from './types';

/**
 * セッション状態
 */
interface SessionState {
  session: AuthSession | null;
  loading: boolean;
  error: Error | null;
}

/**
 * セッション管理フック
 *
 * クライアントサイドでセッション状態を管理し、
 * 認証状態の変更を監視します。
 *
 * @returns セッション状態とローディング状態
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { session, loading } = useSession();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!session) return <div>Not authenticated</div>;
 *
 *   return <div>Welcome, {session.user.email}</div>;
 * }
 * ```
 */
export function useSession() {
  const [state, setState] = useState<SessionState>({
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const supabase = getSupabaseClient();

    // 初期セッションの取得
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          setState({ session: null, loading: false, error });
          return;
        }

        setState({
          session: session ? toAuthSession(session) : null,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          session: null,
          loading: false,
          error: error as Error,
        });
      }
    };

    getInitialSession();

    // 認証状態変更のリスナー
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        session: session ? toAuthSession(session) : null,
        loading: false,
        error: null,
      });
    });

    // クリーンアップ
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

/**
 * 認証済みセッションを要求するフック
 *
 * セッションがない場合はローディング表示を続けます。
 * このフックは認証が必須のページで使用します。
 *
 * @returns 認証済みセッション（nullの場合はリダイレクト処理中）
 *
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const session = useRequireSession();
 *
 *   if (!session) return <div>Redirecting...</div>;
 *
 *   return <div>Protected content</div>;
 * }
 * ```
 */
export function useRequireSession(): AuthSession | null {
  const { session, loading } = useSession();

  useEffect(() => {
    if (!loading && !session) {
      // ミドルウェアがリダイレクトを処理するため、
      // ここでは何もしない
      console.log('No session detected, middleware will redirect');
    }
  }, [session, loading]);

  return session;
}

/**
 * セッションリフレッシュフック
 *
 * 定期的にセッションをリフレッシュして、
 * セッション期限切れを防ぎます。
 *
 * @param intervalMs リフレッシュ間隔（ミリ秒）デフォルト: 5分
 */
export function useSessionRefresh(intervalMs: number = 5 * 60 * 1000) {
  const { session } = useSession();

  useEffect(() => {
    if (!session) return;

    const supabase = getSupabaseClient();

    const refreshSession = async () => {
      try {
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Failed to refresh session:', error);
        }
      } catch (error) {
        console.error('Session refresh error:', error);
      }
    };

    // 定期的にリフレッシュ
    const interval = setInterval(refreshSession, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [session, intervalMs]);
}

/**
 * ユーザーID取得フック
 *
 * 現在ログイン中のユーザーIDを取得します。
 *
 * @returns ユーザーID（セッションがない場合はnull）
 */
export function useUserId(): string | null {
  const { session } = useSession();
  return session?.user.id || null;
}
