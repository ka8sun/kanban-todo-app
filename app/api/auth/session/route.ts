/**
 * セッション同期APIエンドポイント
 * GET /api/auth/session - セッション取得
 * POST /api/auth/session - セッションをCookieに同期
 * DELETE /api/auth/session - セッションをクリア
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabase } from '@/lib/supabase';
import { AuthService } from '@/lib/auth/auth-service';

export async function GET(_request: NextRequest) {
  try {
    // Supabaseクライアントと認証サービスの初期化
    const supabase = createServerSupabase();
    const authService = new AuthService(supabase);

    // セッション取得
    const result = await authService.getSession();

    // エラーの場合
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.statusCode }
      );
    }

    // セッションがない場合
    if (!result.data) {
      return NextResponse.json(
        { session: null },
        { status: 200 }
      );
    }

    // 成功時
    return NextResponse.json(
      { session: result.data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'internal_error',
          message: 'サーバーエラーが発生しました',
          statusCode: 500,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST: セッションをCookieに保存
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { access_token, refresh_token, expires_at } = body;

    if (!access_token) {
      return NextResponse.json(
        { error: 'access_token is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    // アクセストークンをCookieに保存
    cookieStore.set('sb-access-token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_at ? expires_at - Math.floor(Date.now() / 1000) : 3600,
      path: '/',
    });

    // リフレッシュトークンをCookieに保存
    if (refresh_token) {
      cookieStore.set('sb-refresh-token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Cookieからセッションを削除
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete('sb-access-token');
    cookieStore.delete('sb-refresh-token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear session' },
      { status: 500 }
    );
  }
}
