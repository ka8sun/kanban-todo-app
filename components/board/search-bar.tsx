/**
 * SearchBarコンポーネント
 * タスクのテキスト検索機能を提供
 * Requirements: 5.1, 5.2
 */

'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface SearchBarProps {
  onSearchChange: (searchQuery: string) => void;
  placeholder?: string;
}

export function SearchBar({
  onSearchChange,
  placeholder = 'タスクを検索...',
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState('');

  // デバウンス処理: 300ms後に検索実行
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, onSearchChange]);

  const handleClear = useCallback(() => {
    setSearchValue('');
    onSearchChange('');
  }, [onSearchChange]);

  return (
    <div className="relative flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            aria-label="クリア"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
