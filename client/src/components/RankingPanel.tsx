import { useState, useCallback } from 'react';

import { cn } from '../utils/cn';
import type { Ranking, RankPriority } from '../types';

interface RankingPanelProps {
  selectedCandidateIds: string[];
  rankings: Ranking[];
  isLoading: boolean;
  onRank: (jobDescription: string) => Promise<void>;
}

const PRIORITY_STYLES: Record<RankPriority, string> = {
  HIGH: 'bg-green-100 text-green-800 border-green-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  LOW: 'bg-orange-100 text-orange-800 border-orange-300',
  NOT_ELIGIBLE: 'bg-red-100 text-red-800 border-red-300',
};

export const RankingPanel: React.FC<RankingPanelProps> = ({
  selectedCandidateIds,
  rankings,
  isLoading,
  onRank,
}) => {
  const [jobDescription, setJobDescription] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await onRank(jobDescription);
    },
    [jobDescription, onRank]
  );

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Rank Candidates</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Job Description *
            </label>
            <textarea
              id="jobDescription"
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter the job description to rank candidates against..."
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedCandidateIds.length} candidate(s) selected
            </span>
            <button
              type="submit"
              disabled={selectedCandidateIds.length === 0 || isLoading}
              className={cn(
                'px-6 py-2 rounded-md font-medium transition-colors',
                selectedCandidateIds.length === 0 || isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              )}
            >
              {isLoading ? 'Ranking...' : 'Rank Selected Candidates'}
            </button>
          </div>
        </form>
      </div>

      {rankings.length > 0 && (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Ranking Results</h2>

          <div className="space-y-3">
            {rankings.map((ranking, index) => (
              <div
                key={ranking.id}
                className={cn(
                  'p-4 rounded-lg border',
                  PRIORITY_STYLES[ranking.priority]
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-700">#{index + 1}</span>
                    <span className="font-medium">
                      {ranking.candidate?.firstName} {ranking.candidate?.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      Score: {ranking.score}/100
                    </span>
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full border',
                      PRIORITY_STYLES[ranking.priority]
                    )}>
                      {ranking.priority}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{ranking.reasoning}</p>
                {!ranking.isEligible && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    Not eligible for interview
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
