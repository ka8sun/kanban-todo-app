/**
 * サインアウトAPIエンドポイント
 * POST /api/auth/signout
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { AuthService } from '@/lib/auth/auth-service';

export async function POST(_request: NextRequest) {
  try {
    // Supabaseクライアントと認証サービスの初期化
    const supabase = createServerSupabase();
    const authService = new AuthService(supabase);

    // サインアウト実行
    const result = await authService.signOut();

    // エラーの場合
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.statusCode }
      );
    }

    // 成功時
    return NextResponse.json(
      {
        message: 'ログアウトしました',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Signout error:', error);
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
