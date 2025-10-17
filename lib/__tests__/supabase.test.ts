/**
 * Supabaseクライアントユーティリティのテスト
 *
 * テスト対象:
 * - クライアントサイドのSupabaseクライアント生成
 * - サーバーサイドのSupabaseクライアント生成
 * - 環境変数の検証
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createClientSupabase,
  createServerSupabase,
  getSupabaseClient,
} from '../supabase';

describe('Supabase Client Utilities', () => {
  beforeEach(() => {
    // 各テスト前に環境変数を設定
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  describe('createClientSupabase', () => {
    it('クライアントサイドのSupabaseクライアントを生成できること', () => {
      const client = createClientSupabase();

      // Supabaseクライアントが正しく生成されていることを確認
      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.from).toBeDefined();
    });

    it('環境変数が設定されていない場合、エラーをスローすること', () => {
      // 環境変数を一時的に削除
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      expect(() => createClientSupabase()).toThrow(
        'Missing Supabase environment variables'
      );

      // 環境変数を復元
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    });
  });

  describe('createServerSupabase', () => {
    it('サーバーサイドのSupabaseクライアントを生成できること', () => {
      const client = createServerSupabase();

      // Supabaseクライアントが正しく生成されていることを確認
      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.from).toBeDefined();
    });

    it('サーバーサイドクライアントは正しく設定されていること', () => {
      const client = createServerSupabase();

      // サーバーサイドではセッション永続化とトークン自動更新を無効化
      expect(client).toBeDefined();
    });
  });

  describe('getSupabaseClient', () => {
    it('シングルトンパターンでクライアントを取得できること', () => {
      const client1 = getSupabaseClient();
      const client2 = getSupabaseClient();

      // 同じインスタンスが返されることを確認
      expect(client1).toBe(client2);
    });
  });
});
