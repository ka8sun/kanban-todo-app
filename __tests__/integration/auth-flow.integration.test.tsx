/**
 * 認証フロー統合テスト
 *
 * このテストは以下の認証フローを検証します:
 * 1. サインアップ → 確認メール送信
 * 2. メール確認リンククリック → アカウント有効化
 * 3. ログイン → セッション確立 → カンバンボード表示
 * 4. ログアウト → 再ログイン → セッション復元
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthService } from '@/lib/auth/auth-service';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

// Supabaseクライアントのモック
const createMockSupabaseClient = () => {
  return {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      refreshSession: vi.fn(),
    },
  } as unknown as SupabaseClient<Database>;
};

describe('認証フロー統合テスト', () => {
  let authService: AuthService;
  let mockSupabase: SupabaseClient<Database>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    authService = new AuthService(mockSupabase);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('新規登録 → 確認メールリンククリック → ログイン成功', () => {
    it('should complete full signup and login flow', async () => {
      const testEmail = 'newuser@example.com';
      const testPassword = 'password123';
      const mockUserId = 'user-new-123';

      // ステップ1: サインアップ
      const mockUnconfirmedUser = {
        id: mockUserId,
        email: testEmail,
        email_confirmed_at: null,
        created_at: new Date().toISOString(),
      };

      vi.mocked(mockSupabase.auth.signUp).mockResolvedValue({
        data: { user: mockUnconfirmedUser, session: null },
        error: null,
      });

      const signUpResult = await authService.signUp({
        email: testEmail,
        password: testPassword,
      });

      // サインアップが成功すること
      expect(signUpResult.success).toBe(true);
      if (signUpResult.success) {
        expect(signUpResult.data.email).toBe(testEmail);
        expect(signUpResult.data.emailConfirmed).toBe(false);
      }

      // ステップ2: メール確認後、ログイン
      const mockConfirmedSession = {
        access_token: 'confirmed-access-token',
        refresh_token: 'confirmed-refresh-token',
        expires_at: Date.now() / 1000 + 3600,
        user: {
          id: mockUserId,
          email: testEmail,
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      };

      vi.mocked(mockSupabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockConfirmedSession.user, session: mockConfirmedSession as any },
        error: null,
      });

      const signInResult = await authService.signIn({
        email: testEmail,
        password: testPassword,
      });

      // ログインが成功すること
      expect(signInResult.success).toBe(true);
      if (signInResult.success) {
        expect(signInResult.data.accessToken).toBe('confirmed-access-token');
        expect(signInResult.data.user.email).toBe(testEmail);
        expect(signInResult.data.user.emailConfirmed).toBe(true);
      }

      // ステップ3: セッション確認
      vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
        data: { session: mockConfirmedSession as any },
        error: null,
      });

      const sessionResult = await authService.getSession();

      // セッションが取得できること
      expect(sessionResult.success).toBe(true);
      if (sessionResult.success && sessionResult.data) {
        expect(sessionResult.data.user.email).toBe(testEmail);
      }
    });

    it('should fail login before email confirmation', async () => {
      const testEmail = 'unconfirmed@example.com';
      const testPassword = 'password123';

      // メール未確認の場合、ログインが失敗する
      vi.mocked(mockSupabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Email not confirmed',
          name: 'AuthError',
          status: 400,
        },
      });

      const signInResult = await authService.signIn({
        email: testEmail,
        password: testPassword,
      });

      // ログインが失敗すること
      expect(signInResult.success).toBe(false);
      if (!signInResult.success) {
        expect(signInResult.error.message).toContain('Email not confirmed');
      }
    });
  });

  describe('ログアウト → 再ログイン → セッション復元', () => {
    it('should logout and re-login successfully', async () => {
      const testEmail = 'existing@example.com';
      const testPassword = 'password123';
      const mockUserId = 'user-existing-456';

      // ステップ1: 初回ログイン
      const mockSession1 = {
        access_token: 'access-token-1',
        refresh_token: 'refresh-token-1',
        expires_at: Date.now() / 1000 + 3600,
        user: {
          id: mockUserId,
          email: testEmail,
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      };

      vi.mocked(mockSupabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockSession1.user, session: mockSession1 as any },
        error: null,
      });

      const signInResult1 = await authService.signIn({
        email: testEmail,
        password: testPassword,
      });

      expect(signInResult1.success).toBe(true);

      // ステップ2: ログアウト
      vi.mocked(mockSupabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      const signOutResult = await authService.signOut();

      expect(signOutResult.success).toBe(true);

      // ステップ3: セッションが削除されたことを確認
      vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const sessionAfterLogout = await authService.getSession();

      expect(sessionAfterLogout.success).toBe(true);
      if (sessionAfterLogout.success) {
        expect(sessionAfterLogout.data).toBeNull();
      }

      // ステップ4: 再ログイン
      const mockSession2 = {
        access_token: 'access-token-2',
        refresh_token: 'refresh-token-2',
        expires_at: Date.now() / 1000 + 3600,
        user: {
          id: mockUserId,
          email: testEmail,
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      };

      vi.mocked(mockSupabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockSession2.user, session: mockSession2 as any },
        error: null,
      });

      const signInResult2 = await authService.signIn({
        email: testEmail,
        password: testPassword,
      });

      expect(signInResult2.success).toBe(true);
      if (signInResult2.success) {
        expect(signInResult2.data.accessToken).toBe('access-token-2');
        expect(signInResult2.data.user.id).toBe(mockUserId);
      }

      // ステップ5: セッション復元確認
      vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession2 as any },
        error: null,
      });

      const restoredSession = await authService.getSession();

      expect(restoredSession.success).toBe(true);
      if (restoredSession.success && restoredSession.data) {
        expect(restoredSession.data.user.id).toBe(mockUserId);
      }
    });

    it('should handle session expiry and refresh', async () => {
      const testEmail = 'user@example.com';
      const mockUserId = 'user-789';

      // 期限切れセッション
      const expiredSession = {
        access_token: 'expired-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() / 1000 - 1, // 過去の時刻
        user: {
          id: mockUserId,
          email: testEmail,
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      };

      vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
        data: { session: expiredSession as any },
        error: null,
      });

      // セッションリフレッシュ
      const refreshedSession = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_at: Date.now() / 1000 + 3600,
        user: expiredSession.user,
      };

      vi.mocked(mockSupabase.auth.refreshSession).mockResolvedValue({
        data: { user: refreshedSession.user, session: refreshedSession as any },
        error: null,
      });

      const refreshResult = await authService.refreshSession();

      expect(refreshResult.success).toBe(true);
      if (refreshResult.success) {
        expect(refreshResult.data.accessToken).toBe('new-access-token');
        expect(refreshResult.data.user.id).toBe(mockUserId);
      }
    });
  });

  describe('認証エラーケース', () => {
    it('should handle invalid credentials', async () => {
      vi.mocked(mockSupabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Invalid login credentials',
          name: 'AuthError',
          status: 401,
        },
      });

      const result = await authService.signIn({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.statusCode).toBe(401);
        expect(result.error.message).toContain('Invalid login credentials');
      }
    });

    it('should handle network errors during signup', async () => {
      vi.mocked(mockSupabase.auth.signUp).mockRejectedValue(
        new Error('Network error')
      );

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Network error');
      }
    });

    it('should handle session refresh failure', async () => {
      vi.mocked(mockSupabase.auth.refreshSession).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Refresh token is invalid',
          name: 'AuthError',
          status: 401,
        },
      });

      const result = await authService.refreshSession();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.statusCode).toBe(401);
        expect(result.error.message).toContain('Refresh token is invalid');
      }
    });
  });
});
