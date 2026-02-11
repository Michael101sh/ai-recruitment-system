interface RankingStatsProps {
  criteria: string;
  rankedAt: string | null;
  totalCandidates: number;
  totalInSystem?: number;
  totalApproved: number;
  totalRejected: number;
}

export const RankingStats: React.FC<RankingStatsProps> = ({
  criteria,
  rankedAt,
  totalCandidates,
  totalInSystem,
  totalApproved,
  totalRejected,
}) => {
  if (totalCandidates === 0) return null;

  return (
    <div className="flex-shrink-0 flex items-center gap-4 text-sm flex-wrap">
      <span className="text-gray-500">
        <span className="font-semibold text-gray-700">Criteria:</span>{' '}
        {criteria}
      </span>
      {rankedAt && (
        <span className="text-gray-400">
          {new Date(rankedAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </span>
      )}
      <span className="ml-auto flex items-center gap-3">
        <span className="font-bold text-gray-900">
          {totalCandidates} ranked
          {totalInSystem != null && (
            <span className="font-normal text-gray-400"> from {totalInSystem}</span>
          )}
        </span>
        <span className="text-gray-300">|</span>
        <span className="font-bold text-emerald-600">{totalApproved} interview</span>
        <span className="font-bold text-red-500">{totalRejected} rejected</span>
      </span>
    </div>
  );
};
