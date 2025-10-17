/**
 * PriorityFilterコンポーネント
 * タスクの優先度フィルタリング機能を提供
 * Requirements: 5.3, 5.4
 */

'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface PriorityFilterProps {
  onPriorityChange: (priority: 'low' | 'medium' | 'high' | 'all') => void;
  value?: 'low' | 'medium' | 'high' | 'all';
}

export function PriorityFilter({
  onPriorityChange,
  value = 'all',
}: PriorityFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-gray-400" />
      <Select value={value} onValueChange={(val) => onPriorityChange(val as 'low' | 'medium' | 'high' | 'all')}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="優先度" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          <SelectItem value="low">低</SelectItem>
          <SelectItem value="medium">中</SelectItem>
          <SelectItem value="high">高</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
