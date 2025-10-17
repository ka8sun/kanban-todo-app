/**
 * Next.jsミドルウェア
 * 認証チェックとセッション管理を行う
 *
 * 注意: ミドルウェアではSupabaseのセッションをlocalStorageから読み取れないため、
 * Server Components側で認証チェックを行う方針に変更しました。
 * ミドルウェアは基本的なルーティング処理のみを行います。
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ミドルウェアメイン関数
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 静的ファイルとAPIルートはスキップ
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 認証チェックはServer Components側で行うため、
  // ミドルウェアでは何もせずに続行
  return NextResponse.next();
}

/**
 * ミドルウェアを適用するパスの設定
 */
export const config = {
  matcher: [
    /*
     * 以下を除く全てのパスにマッチ:
     * - api (APIルート)
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (ファビコン)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
