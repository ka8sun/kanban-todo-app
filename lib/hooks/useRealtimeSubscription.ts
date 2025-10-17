/**
 * useRealtimeSubscriptionカスタムフック
 * Supabaseリアルタイムサブスクリプションを管理
 * Requirements: 6.3, 7.1
 */

import { useEffect, useRef } from 'react';
import { RealtimeService } from '../services/RealtimeService';
import type { RealtimeEvent } from '../store/types';

interface UseRealtimeSubscriptionOptions {
  userId: string;
  onEvent: (event: RealtimeEvent) => void;
  enabled?: boolean;
}

/**
 * リアルタイムサブスクリプションを管理するカスタムフック
 *
 * @param options - フックのオプション
 * @param options.userId - ユーザーID
 * @param options.onEvent - イベント受信時のコールバック
 * @param options.enabled - サブスクリプションの有効/無効（デフォルト: true）
 * @returns サブスクリプションの状態
 */
export function useRealtimeSubscription({
  userId,
  onEvent,
  enabled = true,
}: UseRealtimeSubscriptionOptions) {
  const serviceRef = useRef<RealtimeService | null>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    // RealtimeServiceのインスタンスを作成
    if (!serviceRef.current) {
      serviceRef.current = new RealtimeService();
    }

    // 購読開始
    const subscribe = async () => {
      if (serviceRef.current && !isSubscribedRef.current) {
        try {
          await serviceRef.current.subscribe(userId, onEvent);
          isSubscribedRef.current = true;
          console.log(`[Realtime] Subscribed to channel: board:${userId}:changes`);
        } catch (error) {
          console.error('[Realtime] Subscription error:', error);
          // エラーが発生した場合、3秒後に再試行
          setTimeout(() => {
            isSubscribedRef.current = false;
            subscribe();
          }, 3000);
        }
      }
    };

    subscribe();

    // クリーンアップ: コンポーネントアンマウント時に購読解除
    return () => {
      if (serviceRef.current) {
        serviceRef.current.unsubscribeAll().then(() => {
          console.log('[Realtime] Unsubscribed all channels');
          isSubscribedRef.current = false;
        });
      }
    };
  }, [userId, enabled, onEvent]);

  return {
    isSubscribed: isSubscribedRef.current,
  };
}
