/**
 * 認証サービスのユニットテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../auth-service';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../database.types';

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

describe('AuthService', () => {
  let authService: AuthService;
  let mockSupabase: SupabaseClient<Database>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    authService = new AuthService(mockSupabase);
  });

  describe('signUp', () => {
    it('有効なメールアドレスとパスワードで成功する', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: null,
        created_at: '2024-10-14T00:00:00Z',
      };

      vi.mocked(mockSupabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('user-123');
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.emailConfirmed).toBe(false);
      }
    });

    it('無効なメールアドレスでバリデーションエラーを返す', async () => {
      const result = await authService.signUp({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('validation_error');
        expect(result.error.message).toContain('有効なメールアドレス');
      }
    });

    it('パスワードが8文字未満でバリデーションエラーを返す', async () => {
      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'pass',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('validation_error');
        expect(result.error.message).toContain('8文字以上');
      }
    });

    it('Supabaseエラー時にエラーを返す', async () => {
      vi.mocked(mockSupabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Email already exists',
          name: 'AuthError',
          status: 400,
        },
      });

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Email already exists');
      }
    });
  });

  describe('signIn', () => {
    it('有効な認証情報でログインに成功する', async () => {
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: 1234567890,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          email_confirmed_at: '2024-10-14T00:00:00Z',
          created_at: '2024-10-14T00:00:00Z',
        },
      };

      vi.mocked(mockSupabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockSession.user, session: mockSession as any },
        error: null,
      });

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.accessToken).toBe('mock-access-token');
        expect(result.data.user.email).toBe('test@example.com');
      }
    });

    it('メールアドレスが空でバリデーションエラーを返す', async () => {
      const result = await authService.signIn({
        email: '',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('validation_error');
        expect(result.error.message).toContain('メールアドレスを入力');
      }
    });

    it('誤った認証情報でエラーを返す', async () => {
      vi.mocked(mockSupabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Invalid credentials',
          name: 'AuthError',
          status: 401,
        },
      });

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Invalid credentials');
      }
    });
  });

  describe('signOut', () => {
    it('ログアウトに成功する', async () => {
      vi.mocked(mockSupabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      const result = await authService.signOut();

      expect(result.success).toBe(true);
    });

    it('Supabaseエラー時にエラーを返す', async () => {
      vi.mocked(mockSupabase.auth.signOut).mockResolvedValue({
        error: {
          message: 'Signout failed',
          name: 'AuthError',
          status: 500,
        },
      });

      const result = await authService.signOut();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Signout failed');
      }
    });
  });

  describe('getSession', () => {
    it('有効なセッションを取得する', async () => {
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: 1234567890,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          email_confirmed_at: '2024-10-14T00:00:00Z',
          created_at: '2024-10-14T00:00:00Z',
        },
      };

      vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      });

      const result = await authService.getSession();

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.accessToken).toBe('mock-access-token');
      }
    });

    it('セッションがない場合nullを返す', async () => {
      vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await authService.getSession();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });
  });

  describe('refreshSession', () => {
    it('セッションのリフレッシュに成功する', async () => {
      const mockSession = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_at: 1234567890,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          email_confirmed_at: '2024-10-14T00:00:00Z',
          created_at: '2024-10-14T00:00:00Z',
        },
      };

      vi.mocked(mockSupabase.auth.refreshSession).mockResolvedValue({
        data: { user: mockSession.user, session: mockSession as any },
        error: null,
      });

      const result = await authService.refreshSession();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.accessToken).toBe('new-access-token');
      }
    });

    it('リフレッシュ失敗時にエラーを返す', async () => {
      vi.mocked(mockSupabase.auth.refreshSession).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Refresh failed',
          name: 'AuthError',
          status: 401,
        },
      });

      const result = await authService.refreshSession();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.statusCode).toBe(401);
      }
    });
  });
});
