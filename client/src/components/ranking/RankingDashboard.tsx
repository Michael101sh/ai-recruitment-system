import { useState, useEffect } from 'react';

import { VirtualList } from '../shared';
import { RankingCard } from './RankingCard';
import { RankingForm } from './RankingForm';
import { RankingStats } from './RankingStats';
import { getApiErrorMessage } from '../../utils/apiError';
import { useInterviewList, useRankAll } from '../../hooks/ranking';
import { useAppStore } from '../../store/useAppStore';

interface RankingDashboardProps {
  onRankingComplete?: () => void;
  totalCandidates?: number;
}

export const RankingDashboard: React.FC<RankingDashboardProps> = ({ onRankingComplete, totalCandidates: totalCandidatesInSystem }) => {
  const [criteria, setCriteria] = useState('');
  const setError = useAppStore((s) => s.setError);

  const { data: interviewList, isLoading, error: queryError } = useInterviewList();
  const rankMutation = useRankAll(setError);

  useEffect(() => {
    if (queryError) {
      setError(getApiErrorMessage(queryError, 'Failed to load interview list. Please try again.'));
    }
  }, [queryError, setError]);

  const handleRankAll = () => {
    setError(null);
    rankMutation.mutate(criteria || undefined, {
      onSuccess: () => onRankingComplete?.(),
    });
  };

  const totalApproved = interviewList?.shouldInterview.length ?? 0;
  const totalRejected = interviewList?.shouldNotInterview.length ?? 0;
  const totalCandidates = totalApproved + totalRejected;

  // Extract the criteria from the first ranking record (all share the same criteria per run)
  const allRankings = [
    ...(interviewList?.shouldInterview ?? []),
    ...(interviewList?.shouldNotInterview ?? []),
  ];
  const rankedCriteria = allRankings[0]?.criteria ?? null;
  const rankedAt = allRankings[0]?.rankedAt ?? null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="relative mb-6">
          <div className="w-14 h-14 rounded-full border-4 border-violet-100 animate-spin border-t-violet-500" />
        </div>
        <p className="text-sm text-gray-500 font-medium">Loading rankings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3">
      {/* ─── Ranking Form ─── */}
      <RankingForm
        criteria={criteria}
        onCriteriaChange={setCriteria}
        onRankAll={handleRankAll}
        isRanking={rankMutation.isPending}
      />

      {/* ─── Stats ─── */}
      <RankingStats
        criteria={rankedCriteria ?? ''}
        rankedAt={rankedAt}
        totalCandidates={totalCandidates}
        totalInSystem={totalCandidatesInSystem}
        totalApproved={totalApproved}
        totalRejected={totalRejected}
      />

      {/* ─── Column Titles (fixed) ─── */}
      <div className="flex-shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-bold text-gray-900">Should Interview</h3>
          {totalApproved > 0 && (
            <span className="badge bg-emerald-100 text-emerald-700 text-[10px]">{totalApproved}</span>
          )}
        </div>
        <div className="hidden lg:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <h3 className="text-sm font-bold text-gray-900">Not Recommended</h3>
          {totalRejected > 0 && (
            <span className="badge bg-red-100 text-red-600 text-[10px]">{totalRejected}</span>
          )}
        </div>
      </div>

      {/* ─── Virtualised Lists ─── */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-4 min-h-0">
        {/* Should Interview */}
        <div className="flex flex-col min-h-0 flex-1 lg:flex-auto">
          {!interviewList || interviewList.shouldInterview.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-sm text-gray-500">No candidates recommended for interview yet.</p>
            </div>
          ) : (
            <VirtualList
              items={interviewList.shouldInterview}
              renderRow={(ranking, idx) => (
                <RankingCard ranking={ranking} index={idx} variant="approved" />
              )}
              estimateSize={() => 152}
              gap={12}
              dynamicHeight
              className="pr-1"
            />
          )}
        </div>

        {/* Should Not Interview */}
        <div className="flex flex-col min-h-0 flex-1 lg:flex-auto">
          {/* Show title on mobile only (since it's hidden in the fixed header on mobile) */}
          <div className="flex lg:hidden items-center gap-2.5 mb-3 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Not Recommended</h3>
            {totalRejected > 0 && (
              <span className="badge bg-red-100 text-red-600">{totalRejected}</span>
            )}
          </div>

          {!interviewList || interviewList.shouldNotInterview.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-sm text-gray-500">No rejected candidates.</p>
            </div>
          ) : (
            <VirtualList
              items={interviewList.shouldNotInterview}
              renderRow={(ranking, idx) => (
                <RankingCard ranking={ranking} index={idx} variant="rejected" />
              )}
              estimateSize={() => 152}
              gap={12}
              dynamicHeight
              className="pr-1"
            />
          )}
        </div>
      </div>
    </div>
  );
};
