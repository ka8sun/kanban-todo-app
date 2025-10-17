/**
 * カンバンボードヘッダーコンポーネント
 * ユーザー情報の表示とログアウトボタン、新しい列を追加ボタンを配置
 */

'use client';

import { Button } from '@/components/ui/button';
import { LogOut, Plus, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CreateColumnModal } from './create-column-modal';
import { SearchBar } from './search-bar';
import { PriorityFilter } from './priority-filter';
import { useBoardStore } from '@/lib/store/useBoardStore';
import { HelpModal } from '@/components/onboarding/help-modal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BoardHeaderProps {
  userEmail: string;
  userId: string;
}

export function BoardHeader({ userEmail, userId }: BoardHeaderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateColumnModal, setShowCreateColumnModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const setSearchQuery = useBoardStore((state: { setSearchQuery: (query: string) => void }) => state.setSearchQuery);
  const setSelectedPriority = useBoardStore((state: { setSelectedPriority: (priority: 'low' | 'medium' | 'high' | 'all') => void }) => state.setSelectedPriority);
  const selectedPriority = useBoardStore((state: { selectedPriority: 'low' | 'medium' | 'high' | 'all' }) => state.selectedPriority);
  const clearFilters = useBoardStore((state: { clearFilters: () => void }) => state.clearFilters);
  const searchQuery = useBoardStore((state: { searchQuery: string }) => state.searchQuery);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/auth/signin');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* 左側: タイトル */}
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                カンバンボード
              </h1>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowCreateColumnModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                新しい列を追加
              </Button>
            </div>

            {/* 中央: 検索バーとフィルター */}
            <div className="flex-1 max-w-2xl mx-4 flex items-center gap-3">
              <SearchBar onSearchChange={setSearchQuery} />
              <PriorityFilter
                onPriorityChange={setSelectedPriority}
                value={selectedPriority}
              />
              {(searchQuery || selectedPriority !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="whitespace-nowrap"
                >
                  フィルタークリア
                </Button>
              )}
            </div>

            {/* 右側: ヘルプ、ユーザー情報、ログアウト */}
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowHelpModal(true)}
                    >
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>ヘルプを表示</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-sm text-gray-600">{userEmail}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoading}
              >
                <LogOut className="mr-2 h-4 w-4" />
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      <CreateColumnModal
        open={showCreateColumnModal}
        onOpenChange={setShowCreateColumnModal}
        userId={userId}
      />

      <HelpModal open={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </>
  );
}
