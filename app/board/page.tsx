/**
 * カンバンボードページ
 * 認証が必要な保護されたページ
 */

import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/server';
import { BoardHeader } from '@/components/board/board-header';
import { KanbanBoard } from '@/components/kanban-board';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ボード | カンバンToDoアプリ',
  description: 'タスクを管理するカンバンボード',
};

export default async function BoardPage() {
  // サーバーサイドで認証チェック
  const session = await getServerSession();

  // 未認証の場合はログインページにリダイレクト
  if (!session) {
    redirect('/auth/signin?redirect=/board');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BoardHeader userEmail={session.user.email} userId={session.user.id} />
      <main className="container mx-auto px-4 py-6">
        <KanbanBoard userId={session.user.id} />
      </main>
    </div>
  );
}
