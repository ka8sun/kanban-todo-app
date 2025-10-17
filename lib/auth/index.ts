/**
 * 認証モジュールのエクスポート
 */

// 認証サービス
export { AuthService } from './auth-service';
export type { IAuthService } from './auth-service';

// 型定義
export type {
  Result,
  AuthUser,
  AuthSession,
  AuthError,
  SignUpRequest,
  SignInRequest,
} from './types';
export { toAuthUser, toAuthSession, toAuthError } from './types';

// サーバーサイドユーティリティ
export {
  getServerSession,
  getServerUserId,
  requireServerSession,
  getSessionToken,
  isSessionExpired,
  shouldRefreshSession,
} from './server';

// クライアントサイドフック
export {
  useSession,
  useRequireSession,
  useSessionRefresh,
  useUserId,
} from './hooks';
