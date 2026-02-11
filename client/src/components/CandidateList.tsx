import { useState, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

import VirtualList from './VirtualList';
import { cn } from '../utils/cn';
import { useDeleteCandidate } from '../hooks/useCandidates';
import { useAppStore } from '../store/useAppStore';
import type { Candidate } from '../types';

type SortOption = 'score-desc' | 'score-asc' | 'name-asc' | 'name-desc' | 'exp-desc' | 'exp-asc';

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'score-desc', label: 'Score: High to Low' },
  { value: 'score-asc', label: 'Score: Low to High' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
  { value: 'exp-desc', label: 'Experience: Most' },
  { value: 'exp-asc', label: 'Experience: Least' },
];

/**
 * Filters candidates by a search query across name, email, and skills
 */
const filterCandidates = (candidates: Candidate[], query: string): Candidate[] => {
  if (!query.trim()) return candidates;
  const lower = query.toLowerCase().trim();
  return candidates.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const email = c.email.toLowerCase();
    const skills = c.skills.map((s) => s.skill.name.toLowerCase()).join(' ');
    return fullName.includes(lower) || email.includes(lower) || skills.includes(lower);
  });
};

/**
 * Sorts candidates by the chosen option
 */
const sortCandidates = (candidates: Candidate[], sort: SortOption): Candidate[] => {
  const sorted = [...candidates];
  sorted.sort((a, b) => {
    switch (sort) {
      case 'score-desc': {
        const sa = a.rankings[0]?.score ?? -1;
        const sb = b.rankings[0]?.score ?? -1;
        return sb - sa;
      }
      case 'score-asc': {
        const sa = a.rankings[0]?.score ?? -1;
        const sb = b.rankings[0]?.score ?? -1;
        return sa - sb;
      }
      case 'name-asc':
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case 'name-desc':
        return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
      case 'exp-desc':
        return b.yearsOfExp - a.yearsOfExp;
      case 'exp-asc':
        return a.yearsOfExp - b.yearsOfExp;
      default:
        return 0;
    }
  });
  return sorted;
};

interface CandidateListProps {
  candidates: Candidate[];
  onRefresh: () => void;
}

/**
 * Returns a gradient for the avatar based on index
 */
const AVATAR_GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-blue-700',
  'from-cyan-500 to-teal-600',
  'from-fuchsia-500 to-purple-600',
];

/**
 * Returns the latest ranking score for a candidate, or null if unranked
 */
const getLatestScore = (candidate: Candidate): number | null => {
  if (candidate.rankings.length === 0) return null;
  return candidate.rankings[0]?.score ?? null;
};

/**
 * Returns score visual config
 */
const getScoreConfig = (score: number) => {
  if (score >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', label: 'Excellent' };
  if (score >= 60) return { bg: 'bg-blue-500', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', label: 'Good' };
  if (score >= 40) return { bg: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', label: 'Average' };
  return { bg: 'bg-red-500', text: 'text-red-700', badge: 'bg-red-100 text-red-700', label: 'Below avg' };
};

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  onRefresh,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('score-desc');
  const setSuccess = useAppStore((s) => s.setSuccess);
  const setError = useAppStore((s) => s.setError);

  const deleteMutation = useDeleteCandidate(
    () => setSuccess('Candidate deleted successfully'),
    setError,
  );

  const filtered = useMemo(
    () => sortCandidates(filterCandidates(candidates, search), sortBy),
    [candidates, search, sortBy]
  );

  const handleDelete = useCallback(
    (candidate: Candidate) => {
      const confirmed = window.confirm(
        `Delete ${candidate.firstName} ${candidate.lastName}?\n\nThis will permanently remove the candidate and all related data (CVs, rankings).`,
      );
      if (confirmed) {
        deleteMutation.mutate(candidate.id);
      }
    },
    [deleteMutation],
  );

  const renderCandidate = useCallback((candidate: Candidate, index: number) => {
    const score = getLatestScore(candidate);
    const scoreConfig = score !== null ? getScoreConfig(score) : null;
    const isExpanded = expandedId === candidate.id;
    const latestCv = candidate.cvs?.[0];
    const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];

    return (
      <div className="glass-card-hover overflow-hidden animate-fade-in">
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className={cn(
              'flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md',
              gradient
            )}>
              <span className="text-lg font-bold text-white">
                {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
              </span>
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {candidate.firstName} {candidate.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {candidate.email}
                    {candidate.phone && (
                      <>
                        <span className="ml-2 text-gray-300">|</span>
                        <span className="ml-2 text-gray-500">{candidate.phone}</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  {/* Score badge */}
                  {scoreConfig && score !== null ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn('badge', scoreConfig.badge)}>
                        {score}/100
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                        {scoreConfig.label}
                      </span>
                    </div>
                  ) : (
                    <span className="badge bg-gray-100 text-gray-500">Unranked</span>
                  )}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(candidate)}
                    disabled={deleteMutation.isPending}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Delete candidate"
                    title="Delete candidate"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Experience and Skills row */}
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  {candidate.yearsOfExp} yr{candidate.yearsOfExp !== 1 ? 's' : ''} exp
                </span>

                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.slice(0, 5).map((cs) => (
                    <span
                      key={cs.skillId}
                      className="px-2 py-0.5 bg-violet-50 text-violet-600 text-xs rounded-md font-medium"
                    >
                      {cs.skill.name}
                    </span>
                  ))}
                  {candidate.skills.length > 5 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-md font-medium">
                      +{candidate.skills.length - 5}
                    </span>
                  )}
                </div>
              </div>

              {/* Score bar */}
              {scoreConfig && score !== null && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', scoreConfig.bg)}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className={cn('text-xs font-semibold', scoreConfig.text)}>
                    {score}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Expand CV toggle */}
          {latestCv && (
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : candidate.id)}
              className="mt-4 flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
            >
              <svg
                className={cn('w-4 h-4 transition-transform duration-200', isExpanded && 'rotate-90')}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              {isExpanded ? 'Hide CV' : 'View CV'}
            </button>
          )}
        </div>

        {/* Expanded CV Content */}
        {isExpanded && latestCv && (
          <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white p-5 animate-scale-in">
            {/* CV Header bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Curriculum Vitae
                </span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                  {latestCv.generatedBy}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(latestCv.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* CV Document */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-h-[32rem] overflow-y-auto">
              {/* Document top accent */}
              <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 rounded-t-xl" />

              <div className="px-8 py-6 cv-document">
                <ReactMarkdown>{latestCv.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, [expandedId]);

  if (candidates.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No candidates yet</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-sm">
            Generate your first batch of candidates using the AI in the Generate tab.
          </p>
          <button type="button" onClick={onRefresh} className="btn-secondary text-sm">
            <svg className="w-4 h-4 mr-1.5 inline" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex-shrink-0 mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">All Candidates</h2>
            <span className="badge bg-violet-100 text-violet-700">{candidates.length}</span>
          </div>
          <button type="button" onClick={onRefresh} className="btn-secondary text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
            Refresh
          </button>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field !pl-9 !py-2 text-sm"
              placeholder="Search by name, email, or skill..."
              aria-label="Search candidates"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="input-field !w-auto !py-2 text-sm text-gray-600 cursor-pointer"
            aria-label="Sort candidates"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {search && (
          <p className="text-xs text-gray-500">
            Showing {filtered.length} of {candidates.length} candidates
          </p>
        )}
      </div>

      {/* Candidate Cards – virtualised */}
      {filtered.length === 0 && search ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p className="text-sm text-gray-500">No candidates match "<span className="font-medium text-gray-700">{search}</span>"</p>
        </div>
      ) : (
        <VirtualList
          items={filtered}
          renderRow={renderCandidate}
          estimateSize={() => 180}
          gap={16}
          dynamicHeight
          className="pr-1"
        />
      )}
    </div>
  );
};
