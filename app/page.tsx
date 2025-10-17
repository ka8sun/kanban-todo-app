/**
 * ホームページ
 * 認証状態に応じて適切なページにリダイレクト
 */

import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';

export default async function Home() {
  // サーバーサイドで認証チェック
  const session = await getServerSession();

  // 認証済みの場合はボードページへ
  if (session) {
    redirect('/board');
  }

  // 未認証の場合はログインページへ
  redirect('/auth/signin');
}
