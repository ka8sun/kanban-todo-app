/**
 * ヘルプモーダルコンポーネント
 * キーボードショートカット、FAQ、主要機能の説明を表示
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

interface HelpSection {
  title: string;
  items: HelpItem[];
}

interface HelpItem {
  label: string;
  description: string;
}

const features: HelpSection = {
  title: '主要機能',
  items: [
    {
      label: 'タスクの作成',
      description: '各列の「+タスクを追加」ボタンから新しいタスクを作成できます。',
    },
    {
      label: 'ドラッグ&ドロップ',
      description: 'タスクをドラッグして列間または列内で移動し、ステータスや優先順位を変更できます。',
    },
    {
      label: '検索とフィルター',
      description: 'ヘッダーの検索ボックスでタスクを検索し、優先度でフィルタリングできます。',
    },
    {
      label: '列の管理',
      description: '「新しい列を追加」ボタンから列を追加し、プロジェクトに合わせたワークフローを構築できます。',
    },
  ],
};

const shortcuts: HelpSection = {
  title: 'キーボードショートカット',
  items: [
    { label: 'Ctrl/Cmd + K', description: '検索ボックスにフォーカス' },
    { label: 'Esc', description: 'モーダルを閉じる' },
    { label: 'Enter', description: 'フォーム送信' },
    { label: 'Tab', description: '次の入力フィールドに移動' },
  ],
};

const faqs: HelpSection = {
  title: 'よくある質問',
  items: [
    {
      label: 'タスクが削除できない',
      description: 'タスクカードをクリックして詳細モーダルを開き、削除ボタンをクリックしてください。',
    },
    {
      label: '列を削除するとタスクはどうなりますか?',
      description: '列を削除すると、その列内の全タスクも一緒に削除されます。',
    },
    {
      label: '複数デバイスでタスクを同期できますか?',
      description: 'はい、リアルタイム同期機能により、変更は自動的に他のデバイスにも反映されます。',
    },
    {
      label: 'オフラインでも使用できますか?',
      description: '現在オフライン機能は未対応です。インターネット接続が必要です。',
    },
  ],
};

export function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">ヘルプ</DialogTitle>
          <DialogDescription>
            カンバンToDoアプリの使い方とよくある質問
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 主要機能 */}
          <section>
            <h3 className="text-lg font-semibold mb-3">{features.title}</h3>
            <dl className="space-y-3">
              {features.items.map((item, index) => (
                <div key={index} className="border-l-2 border-blue-500 pl-3">
                  <dt className="font-medium text-sm">{item.label}</dt>
                  <dd className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* キーボードショートカット */}
          <section>
            <h3 className="text-lg font-semibold mb-3">{shortcuts.title}</h3>
            <dl className="space-y-2">
              {shortcuts.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <dt className="text-sm">{item.description}</dt>
                  <dd className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {item.label}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* よくある質問 */}
          <section>
            <h3 className="text-lg font-semibold mb-3">{faqs.title}</h3>
            <dl className="space-y-3">
              {faqs.items.map((item, index) => (
                <div key={index}>
                  <dt className="font-medium text-sm">Q: {item.label}</dt>
                  <dd className="text-sm text-muted-foreground mt-1">
                    A: {item.description}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
