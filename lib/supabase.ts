/**
 * Supabaseクライアントユーティリティ
 *
 * クライアントサイドとサーバーサイドの両方でSupabaseクライアントを生成するためのユーティリティ関数を提供します。
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * 環境変数の検証
 * @throws {Error} 必要な環境変数が設定されていない場合
 */
function validateEnvironmentVariables(): {
  url: string;
  anonKey: string;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
        'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file.'
    );
  }

  return { url, anonKey };
}

/**
 * クライアントサイド用のSupabaseクライアントを作成
 *
 * ブラウザ環境で使用するSupabaseクライアントを生成します。
 * - セッションの永続化: 有効（localStorageを使用）
 * - トークンの自動更新: 有効
 *
 * @returns {SupabaseClient} Supabaseクライアントインスタンス
 * @throws {Error} 環境変数が設定されていない場合
 *
 * @example
 * ```typescript
 * const supabase = createClientSupabase();
 * const { data, error } = await supabase.auth.signIn({ email, password });
 * ```
 */
export function createClientSupabase(): SupabaseClient<Database> {
  const { url, anonKey } = validateEnvironmentVariables();

  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * サーバーサイド用のSupabaseクライアントを作成
 *
 * Next.js API RoutesやServer Componentsで使用するSupabaseクライアントを生成します。
 * - セッションの永続化: 無効（サーバー環境ではlocalStorageが使用できない）
 * - トークンの自動更新: 無効（サーバー環境では不要）
 *
 * @returns {SupabaseClient} Supabaseクライアントインスタンス
 * @throws {Error} 環境変数が設定されていない場合
 *
 * @example
 * ```typescript
 * // API Route内での使用
 * const supabase = createServerSupabase();
 * const { data, error } = await supabase.from('tasks').select('*');
 * ```
 */
export function createServerSupabase(): SupabaseClient<Database> {
  const { url, anonKey } = validateEnvironmentVariables();

  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * シングルトンパターンによるクライアントサイド用Supabaseクライアント
 *
 * アプリケーション全体で単一のSupabaseクライアントインスタンスを共有します。
 * これにより、複数のコンポーネントで同じクライアントを使用し、
 * 認証状態の一貫性を保つことができます。
 */
let clientSupabaseInstance: SupabaseClient<Database> | null = null;

/**
 * シングルトンパターンでクライアントサイドSupabaseクライアントを取得
 *
 * 初回呼び出し時にクライアントを作成し、以降は同じインスタンスを返します。
 * Client Componentsでの使用を推奨します。
 *
 * @returns {SupabaseClient<Database>} Supabaseクライアントインスタンス
 * @throws {Error} 環境変数が設定されていない場合
 *
 * @example
 * ```typescript
 * 'use client';
 * import { getSupabaseClient } from '@/lib/supabase';
 *
 * function MyComponent() {
 *   const supabase = getSupabaseClient();
 *   // ...
 * }
 * ```
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!clientSupabaseInstance) {
    clientSupabaseInstance = createClientSupabase();
  }
  return clientSupabaseInstance;
}
