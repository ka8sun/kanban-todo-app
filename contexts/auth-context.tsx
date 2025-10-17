/**
 * 認証コンテキスト
 * アプリケーション全体で認証状態を共有
 */

'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { useSession } from '@/lib/auth/hooks';
import type { AuthSession, SignUpRequest, SignInRequest } from '@/lib/auth';

/**
 * 認証コンテキストの値
 */
interface AuthContextValue {
  /** 現在のセッション */
  session: AuthSession | null;
  /** ローディング状態 */
  loading: boolean;
  /** エラー */
  error: Error | null;
  /** サインアップ */
  signUp: (request: SignUpRequest) => Promise<void>;
  /** サインイン */
  signIn: (request: SignInRequest) => Promise<void>;
  /** サインアウト */
  signOut: () => Promise<void>;
}

/**
 * 認証コンテキスト
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * 認証プロバイダーのプロパティ
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * 認証プロバイダー
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { session, loading, error } = useSession();
  const router = useRouter();
  const supabase = getSupabaseClient();

  /**
   * サインアップ
   */
  const signUp = useCallback(
    async (request: SignUpRequest) => {
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'サインアップに失敗しました');
        }

        // サインアップ成功後はログインページにリダイレクト
        router.push('/auth/signin?message=確認メールを送信しました');
      } catch (error) {
        console.error('Signup error:', error);
        throw error;
      }
    },
    [router]
  );

  /**
   * サインイン
   */
  const signIn = useCallback(
    async (request: SignInRequest) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: request.email,
          password: request.password,
        });

        if (error) {
          throw new Error(error.message);
        }

        // サインイン成功後は少し待ってからリダイレクト
        // セッションCookieが確実に設定されるまで待機
        await new Promise(resolve => setTimeout(resolve, 100));

        // ページをリロードしてサーバーサイドのセッションを確実に取得
        window.location.href = '/board';
      } catch (error) {
        console.error('Signin error:', error);
        throw error;
      }
    },
    [supabase]
  );

  /**
   * サインアウト
   */
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      // サインアウト成功後はログインページにリダイレクト
      router.push('/auth/signin');
      router.refresh();
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  }, [router, supabase]);

  const value: AuthContextValue = {
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * 認証コンテキストを使用するフック
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
