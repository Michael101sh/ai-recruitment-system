import { cn } from '../../utils/cn';
import type { Ranking } from '../../types';

// Gold/silver/bronze inspired colors for top 3 positions
const MEDAL_COLORS: Record<number, string> = {
  1: 'from-amber-400 to-yellow-500',
  2: 'from-gray-300 to-gray-400',
  3: 'from-orange-400 to-amber-600',
};

// Only top 3 positions get special medal labels
const getMedalEmoji = (priority: number): string | null => {
  const map: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' };
  return map[priority] ?? null;
};

/**
 * Maps score to color theme and label using standard grading thresholds
 */
const getScoreConfig = (score: number) => {
  if (score >= 80) return { bg: 'bg-emerald-500', ring: 'ring-emerald-200', text: 'text-emerald-700', label: 'Excellent' };
  if (score >= 60) return { bg: 'bg-blue-500', ring: 'ring-blue-200', text: 'text-blue-700', label: 'Good' };
  if (score >= 40) return { bg: 'bg-amber-500', ring: 'ring-amber-200', text: 'text-amber-700', label: 'Average' };
  return { bg: 'bg-red-500', ring: 'ring-red-200', text: 'text-red-700', label: 'Below avg' };
};

interface RankingCardProps {
  ranking: Ranking;
  index: number;
  variant: 'approved' | 'rejected';
}

export const RankingCard: React.FC<RankingCardProps> = ({
  ranking,
  index,
  variant,
}) => {
  const config = getScoreConfig(ranking.score);
  const position = index + 1; // Convert 0-based index to 1-based position
  // Medals only shown for "approved" variant (top interview candidates)
  const medal = variant === 'approved' ? getMedalEmoji(position) : null;
  const medalGradient = variant === 'approved' ? MEDAL_COLORS[position] : null;

  return (
    <div
      className={cn(
        'group relative glass-card-hover p-4 animate-fade-in',
      )}
      // Stagger animation: 60ms delay per item for cascading effect
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
              <span className="text-sm font-bold">#{position}</span>
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
