/**
 * PriorityFilterコンポーネントのユニットテスト
 * Requirements: 5.3, 5.4 - 優先度フィルタリング機能
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { PriorityFilter } from '../priority-filter';

describe('PriorityFilter', () => {
  describe('優先度フィルター', () => {
    it('優先度セレクトが表示されること', () => {
      render(<PriorityFilter onPriorityChange={jest.fn()} />);

      const selectElement = screen.getByRole('combobox');
      expect(selectElement).toBeInTheDocument();
    });

    it('全ての優先度オプションが存在すること', () => {
      render(<PriorityFilter onPriorityChange={jest.fn()} />);

      // セレクトをクリックしてオプションを表示
      const selectElement = screen.getByRole('combobox');
      fireEvent.click(selectElement);

      // すべてのオプションを確認
      expect(screen.getByText('すべて')).toBeInTheDocument();
      expect(screen.getByText('低')).toBeInTheDocument();
      expect(screen.getByText('中')).toBeInTheDocument();
      expect(screen.getByText('高')).toBeInTheDocument();
    });

    it('優先度選択時にonPriorityChangeが呼ばれること', () => {
      const mockOnPriorityChange = jest.fn();
      render(<PriorityFilter onPriorityChange={mockOnPriorityChange} />);

      const selectElement = screen.getByRole('combobox');
      fireEvent.change(selectElement, { target: { value: 'high' } });

      expect(mockOnPriorityChange).toHaveBeenCalledWith('high');
    });

    it('デフォルト値が"all"であること', () => {
      render(<PriorityFilter onPriorityChange={jest.fn()} />);

      const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
      expect(selectElement.value).toBe('all');
    });
  });
});
