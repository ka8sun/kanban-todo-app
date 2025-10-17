/**
 * サインインAPIエンドポイント
 * POST /api/auth/signin
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { AuthService } from '@/lib/auth/auth-service';
import type { SignInRequest } from '@/lib/auth/types';

export async function POST(request: NextRequest) {
  try {
    // リクエストボディの取得
    const body: SignInRequest = await request.json();

    // Supabaseクライアントと認証サービスの初期化
    const supabase = createServerSupabase();
    const authService = new AuthService(supabase);

    // サインイン実行
    const result = await authService.signIn(body);

    // エラーの場合
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.statusCode }
      );
    }

    // 成功時
    // セッション情報をレスポンスで返す
    return NextResponse.json(
      {
        message: 'ログインに成功しました',
        session: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Signin error:', error);
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
