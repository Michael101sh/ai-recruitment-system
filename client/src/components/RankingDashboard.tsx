import { useState, useEffect, useCallback } from 'react';

import { cn } from '../utils/cn';
import { rankingApi } from '../services/api';
import type { InterviewListResponse } from '../types';

/**
 * Returns a Tailwind badge style based on the ranking score
 */
const getScoreBadgeStyle = (score: number): string => {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
};

export const RankingDashboard: React.FC = () => {
  const [interviewList, setInterviewList] = useState<InterviewListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRanking, setIsRanking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [criteria, setCriteria] = useState('');

  const handleFetchInterviewList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await rankingApi.getInterviewList();
      setInterviewList(data);
    } catch (err) {
      setError('Failed to load interview list. Please try again.');
      console.error('Error fetching interview list:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    handleFetchInterviewList();
  }, [handleFetchInterviewList]);

  const handleRankAll = useCallback(async () => {
    setIsRanking(true);
    setError(null);
    try {
      await rankingApi.rankAll(criteria || undefined);
      await handleFetchInterviewList();
    } catch (err) {
      setError('Failed to rank candidates. Please try again.');
      console.error('Error ranking candidates:', err);
    } finally {
      setIsRanking(false);
    }
  }, [criteria, handleFetchInterviewList]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        <span className="ml-4 text-gray-600">Loading rankings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg" role="alert">
          {error}
        </div>
      )}

      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Rank All Candidates</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Criteria (default: Software Engineering Position)"
            aria-label="Ranking criteria"
          />
          <button
            type="button"
            onClick={handleRankAll}
            disabled={isRanking}
            className={cn(
              'px-6 py-2 rounded-md font-medium transition-colors whitespace-nowrap',
              isRanking
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            )}
            aria-label="Rank all candidates"
          >
            {isRanking ? 'Ranking...' : 'Rank All'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            Should Interview
          </h3>

          {!interviewList || interviewList.shouldInterview.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No candidates to interview yet.</p>
          ) : (
            <div className="space-y-3">
              {interviewList.shouldInterview.map((ranking) => (
                <div
                  key={ranking.id}
                  className="p-4 border border-green-200 rounded-lg bg-green-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-600">
                        #{ranking.priority}
                      </span>
                      <span className="font-medium text-gray-900">
                        {ranking.candidate?.firstName} {ranking.candidate?.lastName}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'px-3 py-1 text-xs font-semibold rounded-full border',
                        getScoreBadgeStyle(ranking.score)
                      )}
                    >
                      {ranking.score}/100
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{ranking.reasoning}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            Should Not Interview
          </h3>

          {!interviewList || interviewList.shouldNotInterview.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No rejected candidates.</p>
          ) : (
            <div className="space-y-3">
              {interviewList.shouldNotInterview.map((ranking) => (
                <div
                  key={ranking.id}
                  className="p-4 border border-red-200 rounded-lg bg-red-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {ranking.candidate?.firstName} {ranking.candidate?.lastName}
                    </span>
                    <span
                      className={cn(
                        'px-3 py-1 text-xs font-semibold rounded-full border',
                        getScoreBadgeStyle(ranking.score)
                      )}
                    >
                      {ranking.score}/100
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{ranking.reasoning}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
