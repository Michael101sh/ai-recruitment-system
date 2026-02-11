import { useState } from 'react';

import { cn } from '../utils/cn';
import type { Candidate } from '../types';

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
    <div className="space-y-5">
      {/* Header bar */}
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

      {/* Candidate Cards */}
      <div className="grid gap-4">
        {candidates.map((candidate, index) => {
          const score = getLatestScore(candidate);
          const scoreConfig = score !== null ? getScoreConfig(score) : null;
          const isExpanded = expandedId === candidate.id;
          const latestCv = candidate.cvs?.[0];
          const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];

          return (
            <div
              key={candidate.id}
              className="glass-card-hover overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
            >
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
                        <p className="text-sm text-gray-500">{candidate.email}</p>
                      </div>

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
                <div className="border-t border-gray-100 bg-gray-50/50 p-5 animate-scale-in">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Generated CV
                    </span>
                    <span className="text-xs text-gray-400">
                      &middot; {latestCv.generatedBy}
                    </span>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 max-h-80 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                      {latestCv.content}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
