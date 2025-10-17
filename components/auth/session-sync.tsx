/**
 * セッション同期コンポーネント
 * クライアントサイドのSupabaseセッションをサーバーサイドのCookieに同期
 */

'use client';

import { useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

export function SessionSync() {
  useEffect(() => {
    const supabase = getSupabaseClient();

    // セッション変更を監視してCookieに同期
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // セッション情報をサーバーに同期
      if (session) {
        // APIルートを通じてセッションをCookieに保存
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
          }),
        });
      } else if (event === 'SIGNED_OUT') {
        // サインアウト時はCookieをクリア
        await fetch('/api/auth/session', {
          method: 'DELETE',
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
