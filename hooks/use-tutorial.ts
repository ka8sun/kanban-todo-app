/**
 * チュートリアル表示状態を管理するカスタムフック
 */

'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'kanban-tutorial-completed';

export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // localStorageをチェック
    const completed = localStorage.getItem(STORAGE_KEY);
    setShowTutorial(completed !== 'true');
  }, []);

  const completeTutorial = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowTutorial(false);
  };

  const skipTutorial = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShowTutorial(true);
  };

  return {
    showTutorial,
    completeTutorial,
    skipTutorial,
    resetTutorial,
  };
}
