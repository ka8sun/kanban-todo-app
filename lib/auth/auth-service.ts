/**
 * 認証サービス
 * Supabase Authを使用したユーザー認証機能を提供
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import type {
  Result,
  AuthUser,
  AuthSession,
  SignUpRequest,
  SignInRequest,
} from './types';
import { toAuthUser, toAuthSession, toAuthError } from './types';

/**
 * 認証サービスインターフェース
 */
export interface IAuthService {
  /**
   * 新規ユーザー登録
   * @param request サインアップリクエスト
   * @returns 認証ユーザー情報（確認メール送信後）
   */
  signUp(request: SignUpRequest): Promise<Result<AuthUser>>;

  /**
   * ユーザーログイン
   * @param request サインインリクエスト
   * @returns 認証セッション情報
   */
  signIn(request: SignInRequest): Promise<Result<AuthSession>>;

  /**
   * ユーザーログアウト
   * @returns 成功時はvoid
   */
  signOut(): Promise<Result<void>>;

  /**
   * 現在のセッション取得
   * @returns セッション情報（セッションがない場合はnull）
   */
  getSession(): Promise<Result<AuthSession | null>>;

  /**
   * セッションのリフレッシュ
   * @returns 新しいセッション情報
   */
  refreshSession(): Promise<Result<AuthSession>>;
}

/**
 * Supabase Authを使用した認証サービス実装
 */
export class AuthService implements IAuthService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * 新規ユーザー登録
   */
  async signUp(request: SignUpRequest): Promise<Result<AuthUser>> {
    try {
      // 入力バリデーション
      const validationError = this.validateSignUpRequest(request);
      if (validationError) {
        return {
          success: false,
          error: {
            code: 'validation_error',
            message: validationError,
            statusCode: 400,
          },
        };
      }

      // Supabase Authでユーザー登録
      const { data, error } = await this.supabase.auth.signUp({
        email: request.email,
        password: request.password,
      });

      if (error) {
        return {
          success: false,
          error: toAuthError(error),
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: {
            code: 'signup_failed',
            message: 'ユーザー登録に失敗しました',
            statusCode: 500,
          },
        };
      }

      return {
        success: true,
        data: toAuthUser(data.user),
      };
    } catch (error) {
      return {
        success: false,
        error: toAuthError(error),
      };
    }
  }

  /**
   * ユーザーログイン
   */
  async signIn(request: SignInRequest): Promise<Result<AuthSession>> {
    try {
      // 入力バリデーション
      const validationError = this.validateSignInRequest(request);
      if (validationError) {
        return {
          success: false,
          error: {
            code: 'validation_error',
            message: validationError,
            statusCode: 400,
          },
        };
      }

      // Supabase Authでログイン
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: request.email,
        password: request.password,
      });

      if (error) {
        return {
          success: false,
          error: toAuthError(error),
        };
      }

      if (!data.session) {
        return {
          success: false,
          error: {
            code: 'signin_failed',
            message: 'ログインに失敗しました',
            statusCode: 500,
          },
        };
      }

      return {
        success: true,
        data: toAuthSession(data.session),
      };
    } catch (error) {
      return {
        success: false,
        error: toAuthError(error),
      };
    }
  }

  /**
   * ユーザーログアウト
   */
  async signOut(): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: toAuthError(error),
        };
      }

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: toAuthError(error),
      };
    }
  }

  /**
   * 現在のセッション取得
   */
  async getSession(): Promise<Result<AuthSession | null>> {
    try {
      const { data, error } = await this.supabase.auth.getSession();

      if (error) {
        return {
          success: false,
          error: toAuthError(error),
        };
      }

      if (!data.session) {
        return {
          success: true,
          data: null,
        };
      }

      return {
        success: true,
        data: toAuthSession(data.session),
      };
    } catch (error) {
      return {
        success: false,
        error: toAuthError(error),
      };
    }
  }

  /**
   * セッションのリフレッシュ
   */
  async refreshSession(): Promise<Result<AuthSession>> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();

      if (error) {
        return {
          success: false,
          error: toAuthError(error),
        };
      }

      if (!data.session) {
        return {
          success: false,
          error: {
            code: 'refresh_failed',
            message: 'セッションのリフレッシュに失敗しました',
            statusCode: 401,
          },
        };
      }

      return {
        success: true,
        data: toAuthSession(data.session),
      };
    } catch (error) {
      return {
        success: false,
        error: toAuthError(error),
      };
    }
  }

  /**
   * サインアップリクエストのバリデーション
   */
  private validateSignUpRequest(request: SignUpRequest): string | null {
    if (!request.email || !request.email.trim()) {
      return 'メールアドレスを入力してください';
    }

    if (!this.isValidEmail(request.email)) {
      return '有効なメールアドレスを入力してください';
    }

    if (!request.password || request.password.length < 8) {
      return 'パスワードは8文字以上で入力してください';
    }

    return null;
  }

  /**
   * サインインリクエストのバリデーション
   */
  private validateSignInRequest(request: SignInRequest): string | null {
    if (!request.email || !request.email.trim()) {
      return 'メールアドレスを入力してください';
    }

    if (!request.password) {
      return 'パスワードを入力してください';
    }

    return null;
  }

  /**
   * メールアドレスの形式チェック
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
