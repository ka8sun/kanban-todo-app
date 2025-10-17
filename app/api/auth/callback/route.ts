/**
 * Supabase認証コールバックAPIルート
 * 認証後のセッション情報をCookieに保存
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // 認証コードを使用してセッションを取得
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=authorization_code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
      },
      body: JSON.stringify({ auth_code: code }),
    });

    if (response.ok) {
      const data = await response.json();

      // セッション情報をCookieに保存
      const cookieStore = await cookies();
      cookieStore.set('sb-access-token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: data.expires_in,
        path: '/',
      });

      if (data.refresh_token) {
        cookieStore.set('sb-refresh-token', data.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });
      }
    }
  }

  // リダイレクト先を取得（デフォルトはボードページ）
  const redirectTo = requestUrl.searchParams.get('redirect') || '/board';
  return NextResponse.redirect(new URL(redirectTo, request.url));
}
