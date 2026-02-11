import { useState, useCallback } from 'react';

import type { BatchGenerationResult } from '../../types';

const STEP_MESSAGES = [
  'Crafting unique candidate personas...',
  'Generating professional backgrounds...',
  'Building skill profiles...',
  'Writing personalized CVs...',
  'Finalizing candidate records...',
];

interface UseGenerateFlowResult {
  isGenerating: boolean;
  result: BatchGenerationResult | null;
  stepIndex: number;
  stepMessage: string;
  handleGenerate: () => Promise<void>;
}

export const useGenerateFlow = (
  count: number,
  onGenerate: (count: number) => Promise<BatchGenerationResult>,
): UseGenerateFlowResult => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<BatchGenerationResult | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const handleGenerate = useCallback(async () => {
    setResult(null);
    setStepIndex(0);
    setIsGenerating(true);

    // Cycle through step messages every 3s to show progress during long-running generation
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEP_MESSAGES.length);
    }, 3000);

    try {
      const batchResult = await onGenerate(count);
      setResult(batchResult);
    } finally {
      // Always clear interval and reset state, even on error
      clearInterval(interval);
      setIsGenerating(false);
    }
  }, [count, onGenerate]);

  // Fallback chain ensures we always have a valid message
  const stepMessage = STEP_MESSAGES[stepIndex] ?? STEP_MESSAGES[0] ?? 'Processing...';

  return {
    isGenerating,
    result,
    stepIndex,
    stepMessage,
    handleGenerate,
  };
};
