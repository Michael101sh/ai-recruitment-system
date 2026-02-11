import { useState, useCallback } from 'react';

import { cn } from '../utils/cn';
import type { BatchGenerationResult } from '../types';

interface GenerateCandidatesProps {
  onGenerate: (count: number) => Promise<BatchGenerationResult>;
  isLoading: boolean;
}

export const GenerateCandidates: React.FC<GenerateCandidatesProps> = ({
  onGenerate,
  isLoading,
}) => {
  const [count, setCount] = useState(3);
  const [result, setResult] = useState<BatchGenerationResult | null>(null);

  const handleGenerate = useCallback(async () => {
    const batchResult = await onGenerate(count);
    setResult(batchResult);
  }, [count, onGenerate]);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Generate Candidates with AI
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Claude AI will create realistic candidate profiles and generate professional CVs for each one.
        </p>

        <div className="flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label htmlFor="candidateCount" className="block text-sm font-medium text-gray-700 mb-1">
              Number of candidates
            </label>
            <input
              id="candidateCount"
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1)))}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
              aria-label="Number of candidates to generate"
            />
            <p className="text-xs text-gray-400 mt-1">Between 1 and 10</p>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className={cn(
              'px-6 py-2 rounded-md font-medium transition-colors whitespace-nowrap',
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
            aria-label={`Generate ${count} candidates with AI`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Generating...
              </span>
            ) : (
              `Generate ${count} Candidate${count > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            <span className="ml-4 text-gray-600">
              AI is generating {count} candidate profile{count > 1 ? 's' : ''} and CV{count > 1 ? 's' : ''}...
              This may take a minute.
            </span>
          </div>
        </div>
      )}

      {!isLoading && result && (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            Successfully generated {result.generated} candidate{result.generated > 1 ? 's' : ''}
          </h3>

          <div className="space-y-2">
            {result.candidates.map((candidate) => (
              <div
                key={candidate.candidateId}
                className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                <span className="font-medium text-gray-900">{candidate.name}</span>
                <span className="text-xs text-gray-400">CV generated</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-4">
            View all candidates and their CVs in the "All Candidates" tab.
          </p>
        </div>
      )}
    </div>
  );
};
