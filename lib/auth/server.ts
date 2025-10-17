/**
 * サーバーサイド認証ユーティリティ
 * Next.js Server ComponentsやAPI Routesで使用
 */

import { cookies } from 'next/headers';
import { createServerSupabase } from '@/lib/supabase';
import type { AuthSession } from './types';
import { toAuthSession } from './types';

/**
 * サーバーサイドでセッションを取得
 *
 * @returns セッション情報（セッションがない場合はnull）
 * @throws エラーが発生した場合
 */
export async function getServerSession(): Promise<AuthSession | null> {
  try {
    // まずCookieからトークンを取得
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      // トークンがない場合はセッションなし
      return null;
    }

    // トークンを使用してSupabaseクライアントを初期化
    const supabase = createServerSupabase();

    // セッションを設定
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.error('Get user error:', userError);
      return null;
    }

    // セッション情報を構築
    const refreshToken = cookieStore.get('sb-refresh-token')?.value || '';
    const session = {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: user,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1時間後
      expires_in: 3600,
      token_type: 'bearer' as const,
    };

    return toAuthSession(session);
  } catch (error) {
    console.error('Get server session error:', error);
    return null;
  }
}

/**
 * サーバーサイドで現在のユーザーIDを取得
 *
 * @returns ユーザーID（セッションがない場合はnull）
 */
export async function getServerUserId(): Promise<string | null> {
  const session = await getServerSession();
  return session?.user.id || null;
}

/**
 * サーバーサイドで認証が必要なページの保護
 *
 * @returns セッション情報
 * @throws セッションがない場合はエラー
 */
export async function requireServerSession(): Promise<AuthSession> {
  const session = await getServerSession();

  if (!session) {
    throw new Error('Unauthorized: No active session');
  }

  return session;
}

/**
 * クッキーからセッショントークンを取得
 *
 * @returns アクセストークン（存在しない場合はnull）
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();

  // Supabaseのデフォルトクッキー名
  const accessToken = cookieStore.get('sb-access-token')?.value || null;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value || null;

  return accessToken || refreshToken;
}

/**
 * セッションの有効期限をチェック
 *
 * @param session セッション情報
 * @returns 有効期限が切れている場合true
 */
export function isSessionExpired(session: AuthSession): boolean {
  const now = Math.floor(Date.now() / 1000);
  return session.expiresAt < now;
}

/**
 * セッションのリフレッシュが必要かチェック
 * リフレッシュは有効期限の5分前から可能
 *
 * @param session セッション情報
 * @returns リフレッシュが必要な場合true
 */
export function shouldRefreshSession(session: AuthSession): boolean {
  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;
  return session.expiresAt - now < fiveMinutes;
}
