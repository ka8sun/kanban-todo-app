/**
 * 認証関連の型定義
 */

import type { User, Session } from '@supabase/supabase-js';

/**
 * 認証結果の型
 * 成功時はdataを、失敗時はerrorを返す
 */
export type Result<T, E = AuthError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * 認証ユーザー情報
 */
export interface AuthUser {
  id: string;
  email: string;
  emailConfirmed: boolean;
  createdAt: string;
}

/**
 * 認証セッション情報
 */
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  expiresAt: number;
}

/**
 * 認証エラー情報
 */
export interface AuthError {
  code: string;
  message: string;
  statusCode: number;
}

/**
 * サインアップリクエスト
 */
export interface SignUpRequest {
  email: string;
  password: string;
}

/**
 * サインインリクエスト
 */
export interface SignInRequest {
  email: string;
  password: string;
}

/**
 * Supabase UserをAuthUserに変換
 */
export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email || '',
    emailConfirmed: !!user.email_confirmed_at,
    createdAt: user.created_at,
  };
}

/**
 * Supabase SessionをAuthSessionに変換
 */
export function toAuthSession(session: Session): AuthSession {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user: toAuthUser(session.user),
    expiresAt: session.expires_at || 0,
  };
}

/**
 * エラーをAuthErrorに変換
 */
export function toAuthError(error: any): AuthError {
  // Supabaseの認証エラーコードに応じて日本語メッセージを提供
  let message = error.message || '不明なエラーが発生しました';

  if (error.message === 'Invalid login credentials') {
    message = 'メールアドレスまたはパスワードが正しくありません。メールアドレスが確認されているか、入力内容をご確認ください。';
  } else if (error.message === 'Email not confirmed') {
    message = 'メールアドレスが確認されていません。登録時に送信された確認メールのリンクをクリックしてください。';
  } else if (error.message?.includes('email')) {
    message = 'メールアドレスに関するエラーが発生しました。入力内容をご確認ください。';
  }

  return {
    code: error.code || 'unknown_error',
    message,
    statusCode: error.status || 500,
  };
}
