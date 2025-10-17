/**
 * チュートリアルモーダルコンポーネント
 * 初回利用時にアプリの使い方を案内
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TutorialModalProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'タスクの作成',
    description:
      '各列の「+タスクを追加」ボタンをクリックして、新しいタスクを作成できます。タスクにはタイトル、説明、優先度を設定できます。',
    icon: '📝',
  },
  {
    title: 'ドラッグ&ドロップ',
    description:
      'タスクをドラッグ&ドロップして、列間または列内で自由に移動できます。タスクのステータス変更や優先順位の調整が直感的に行えます。',
    icon: '🖱️',
  },
  {
    title: '列の追加',
    description:
      '「新しい列を追加」ボタンをクリックして、カスタムステータス列を追加できます。プロジェクトに合わせたワークフローを構築しましょう。',
    icon: '➕',
  },
];

export function TutorialModal({ open, onComplete, onSkip }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    setCurrentStep(0);
    onComplete();
  };

  const handleSkip = () => {
    setCurrentStep(0);
    onSkip();
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const step = tutorialSteps[currentStep];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            ようこそカンバンToDoアプリへ! {step?.icon}
          </DialogTitle>
          <DialogDescription>
            主要機能の使い方をご案内します
          </DialogDescription>
        </DialogHeader>

        {step && (
          <div className="py-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-6xl">{step.icon}</div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-center text-muted-foreground">
                {step.description}
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <div className="text-sm text-muted-foreground">
                {currentStep + 1} / {tutorialSteps.length}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleSkip}>
            スキップ
          </Button>
          <div className="flex gap-2 flex-1 justify-end">
            {!isFirstStep && (
              <Button variant="outline" onClick={handleBack}>
                戻る
              </Button>
            )}
            {isLastStep ? (
              <Button onClick={handleComplete}>完了</Button>
            ) : (
              <Button onClick={handleNext}>次へ</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
