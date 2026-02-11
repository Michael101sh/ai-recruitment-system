import { useState, useEffect, useCallback } from 'react';

import { cn } from '../utils/cn';
import { rankingApi } from '../services/api';
import type { InterviewListResponse, Ranking } from '../types';

/** Medal icons for top 3 */
const MEDAL_COLORS: Record<number, string> = {
  1: 'from-amber-400 to-yellow-500',
  2: 'from-gray-300 to-gray-400',
  3: 'from-orange-400 to-amber-600',
};

const getMedalEmoji = (priority: number): string | null => {
  const map: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' };
  return map[priority] ?? null;
};

const getScoreConfig = (score: number) => {
  if (score >= 80) return { bg: 'bg-emerald-500', ring: 'ring-emerald-200', text: 'text-emerald-700', label: 'Excellent' };
  if (score >= 60) return { bg: 'bg-blue-500', ring: 'ring-blue-200', text: 'text-blue-700', label: 'Good' };
  if (score >= 40) return { bg: 'bg-amber-500', ring: 'ring-amber-200', text: 'text-amber-700', label: 'Average' };
  return { bg: 'bg-red-500', ring: 'ring-red-200', text: 'text-red-700', label: 'Below avg' };
};

const RankingCard: React.FC<{ ranking: Ranking; index: number; variant: 'approved' | 'rejected' }> = ({
  ranking,
  index,
  variant,
}) => {
  const config = getScoreConfig(ranking.score);
  const medal = variant === 'approved' ? getMedalEmoji(ranking.priority) : null;
  const medalGradient = variant === 'approved' ? MEDAL_COLORS[ranking.priority] : null;

  return (
    <div
      className={cn(
        'group relative glass-card-hover p-4 animate-fade-in',
        variant === 'approved' && ranking.priority <= 3 && 'ring-1',
        variant === 'approved' && ranking.priority <= 3 && config.ring,
      )}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex items-start gap-3.5">
        {/* Priority / Position badge */}
        {variant === 'approved' ? (
          <div className={cn(
            'flex-shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center',
            medalGradient
              ? `bg-gradient-to-br ${medalGradient} text-white shadow-md`
              : 'bg-gray-100 text-gray-600'
          )}>
            {medal ? (
              <span className="text-xs font-bold leading-none">{medal}</span>
            ) : (
              <span className="text-sm font-bold">#{ranking.priority}</span>
            )}
          </div>
        ) : (
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="truncate">
              <h4 className="font-semibold text-gray-900 inline">
                {ranking.candidate?.firstName} {ranking.candidate?.lastName}
              </h4>
              {ranking.candidate?.email && (
                <span className="text-xs text-gray-400 ml-1.5">
                  ({ranking.candidate.email})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={cn('text-lg font-bold', config.text)}>
                {ranking.score}
              </span>
              <span className="text-xs text-gray-400">/100</span>
            </div>
          </div>

          {/* Score bar */}
          <div className="mb-2.5">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-1000 ease-out', config.bg)}
                style={{ width: `${ranking.score}%` }}
              />
            </div>
          </div>

          {/* Reasoning */}
          <p className="text-sm text-gray-600 leading-relaxed">{ranking.reasoning}</p>
        </div>
      </div>
    </div>
  );
};

interface RankingDashboardProps {
  onRankingComplete?: () => void;
}

export const RankingDashboard: React.FC<RankingDashboardProps> = ({ onRankingComplete }) => {
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
      onRankingComplete?.();
    } catch (err) {
      setError('Failed to rank candidates. Please try again.');
      console.error('Error ranking candidates:', err);
    } finally {
      setIsRanking(false);
    }
  }, [criteria, handleFetchInterviewList, onRankingComplete]);

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
      {error && (
        <div className="flex-shrink-0 flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl animate-fade-in" role="alert">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* ─── Compact Action Bar ─── */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={criteria}
          onChange={(e) => setCriteria(e.target.value)}
          className="input-field flex-1 !py-2 text-sm"
          placeholder="Criteria, e.g. Senior Full-Stack Engineer, React & Node.js"
          aria-label="Ranking criteria"
        />
        <button
          type="button"
          onClick={handleRankAll}
          disabled={isRanking}
          className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap text-sm !py-2"
          aria-label="Rank all candidates"
        >
          {isRanking ? (
            <>
              <span className="animate-spin inline-block h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full" />
              Ranking...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
              Rank All
            </>
          )}
        </button>
      </div>

      {/* ─── Criteria + Stats in one row ─── */}
      {totalCandidates > 0 && (
        <div className="flex-shrink-0 flex items-center gap-4 text-sm flex-wrap">
          <span className="text-gray-500">
            <span className="font-semibold text-gray-700">Criteria:</span>{' '}
            {rankedCriteria}
          </span>
          {rankedAt && (
            <span className="text-gray-400">
              {new Date(rankedAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </span>
          )}
          <span className="ml-auto flex items-center gap-3">
            <span className="font-bold text-gray-900">{totalCandidates} ranked</span>
            <span className="font-bold text-emerald-600">{totalApproved} interview</span>
            <span className="font-bold text-red-500">{totalRejected} rejected</span>
          </span>
        </div>
      )}

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

      {/* ─── Scrollable Lists ─── */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Should Interview */}
          <div>
            {!interviewList || interviewList.shouldInterview.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-sm text-gray-500">No candidates recommended for interview yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {interviewList.shouldInterview.map((ranking, idx) => (
                  <RankingCard key={ranking.id} ranking={ranking} index={idx} variant="approved" />
                ))}
              </div>
            )}
          </div>

          {/* Should Not Interview */}
          <div>
            {/* Show title on mobile only (since it's hidden in the fixed header on mobile) */}
            <div className="flex lg:hidden items-center gap-2.5 mb-4">
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
              <div className="space-y-3">
                {interviewList.shouldNotInterview.map((ranking, idx) => (
                  <RankingCard key={ranking.id} ranking={ranking} index={idx} variant="rejected" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
