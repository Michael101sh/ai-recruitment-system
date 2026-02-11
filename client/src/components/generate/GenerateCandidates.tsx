import { useState } from 'react';

import { cn } from '../../utils/cn';
import { useGenerateFlow } from '../../hooks/generate';
import type { BatchGenerationResult } from '../../types';

interface GenerateCandidatesProps {
  onGenerate: (count: number) => Promise<BatchGenerationResult>;
}

export const GenerateCandidates: React.FC<GenerateCandidatesProps> = ({
  onGenerate,
}) => {
  const [count, setCount] = useState(3);
  const { isGenerating, result, stepMessage, handleGenerate } = useGenerateFlow(count, onGenerate);

  return (
    <div className="space-y-6">
      {/* ─── Hero Card ─── */}
      <div className="relative overflow-hidden glass-card p-8">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-violet-200/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-indigo-200/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100 text-violet-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Generate Candidates with AI</h2>
              <p className="text-sm text-gray-500">
                Claude creates realistic profiles with diverse skills, experience, and CVs
              </p>
            </div>
          </div>

          <div className="mt-8">
            <label htmlFor="candidateCount" className="block text-sm font-medium text-gray-700 mb-2">
              Number of candidates
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCount((prev) => Math.max(1, prev - 1))}
                  disabled={isGenerating || count <= 1}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 transition-all duration-200 active:scale-95"
                  aria-label="Decrease count"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                  </svg>
                </button>

                <input
                  id="candidateCount"
                  type="number"
                  min={1}
                  max={10}
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1)))}
                  disabled={isGenerating}
                  className="w-16 h-10 text-center text-xl font-bold text-gray-900 input-field !px-2 !py-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="Number of candidates to generate"
                />

                <button
                  type="button"
                  onClick={() => setCount((prev) => Math.min(10, prev + 1))}
                  disabled={isGenerating || count >= 10}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 transition-all duration-200 active:scale-95"
                  aria-label="Increase count"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className={cn('btn-primary flex items-center gap-2.5 h-10 text-sm', isGenerating && 'shimmer-bg')}
                aria-label={`Generate ${count} candidates with AI`}
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                    </svg>
                    Generate {count} Candidate{count > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Between 1 and 10</p>
          </div>
        </div>
      </div>

      {/* ─── Loading State ─── */}
      {isGenerating && (
        <div className="glass-card p-8 animate-fade-in">
          <div className="flex flex-col items-center text-center py-4">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-violet-100 border-t-violet-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                </svg>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              AI is generating {count} candidate{count > 1 ? 's' : ''}
            </h3>
            <p className="text-sm text-gray-500 mb-4 animate-pulse-soft">
              {stepMessage}
            </p>

            <div className="w-full max-w-sm">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-400 to-violet-600 rounded-full shimmer-bg w-full" />
              </div>
              <p className="text-xs text-gray-400 mt-2">This may take up to a minute</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Results ─── */}
      {!isGenerating && result && (
        <div className="glass-card p-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {result.generated} Candidate{result.generated > 1 ? 's' : ''} Generated
              </h3>
              <p className="text-sm text-gray-500">Profiles and CVs are ready for review</p>
            </div>
          </div>

          <div className="space-y-2">
            {result.candidates.map((candidate, index) => (
              <div
                key={candidate.candidateId}
                className="flex items-center gap-4 p-3.5 bg-emerald-50/60 border border-emerald-200/50 rounded-xl animate-slide-in"
                style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'backwards' }}
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-200/60 flex items-center justify-center">
                  <span className="text-sm font-bold text-emerald-700">{candidate.name.charAt(0)}</span>
                </div>
                <span className="font-medium text-gray-900 flex-1">{candidate.name}</span>
                <span className="badge bg-emerald-100 text-emerald-700">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  CV Ready
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <p className="text-sm text-gray-500">
              Switch to the <strong>Candidates</strong> tab to view full profiles and CVs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
