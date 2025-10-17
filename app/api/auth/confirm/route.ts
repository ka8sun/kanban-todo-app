/**
 * メール確認APIエンドポイント
 * GET /api/auth/confirm
 *
 * Supabaseから送信された確認メールのリンクをクリックした際に呼び出されます。
 * トークンを検証し、アカウントを有効化します。
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    // トークンハッシュとタイプのチェック
    if (!token_hash || !type) {
      return NextResponse.redirect(
        new URL('/auth/error?message=無効な確認リンクです', request.url)
      );
    }

    // Supabaseクライアントの初期化
    const supabase = createServerSupabase();

    // トークンの検証
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (error) {
      console.error('Email confirmation error:', error);
      return NextResponse.redirect(
        new URL(
          `/auth/error?message=${encodeURIComponent('メール確認に失敗しました: ' + error.message)}`,
          request.url
        )
      );
    }

    // 成功時はログインページにリダイレクト
    return NextResponse.redirect(
      new URL('/auth/signin?message=メール確認が完了しました。ログインしてください。', request.url)
    );
  } catch (error) {
    console.error('Email confirmation error:', error);
    return NextResponse.redirect(
      new URL('/auth/error?message=サーバーエラーが発生しました', request.url)
    );
  }
}
