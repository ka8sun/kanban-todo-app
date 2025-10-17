/**
 * サインアップAPIエンドポイント
 * POST /api/auth/signup
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { AuthService } from '@/lib/auth/auth-service';
import type { SignUpRequest } from '@/lib/auth/types';

export async function POST(request: NextRequest) {
  try {
    // リクエストボディの取得
    const body: SignUpRequest = await request.json();

    // Supabaseクライアントと認証サービスの初期化
    const supabase = createServerSupabase();
    const authService = new AuthService(supabase);

    // サインアップ実行
    const result = await authService.signUp(body);

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
        message: '確認メールを送信しました。メールを確認してアカウントを有効化してください。',
        user: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
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
