import { cn } from '../utils/cn';
import type { Candidate } from '../types';

interface CandidateListProps {
  candidates: Candidate[];
  onRefresh: () => void;
}

/**
 * Returns the latest ranking score for a candidate, or null if unranked
 */
const getLatestScore = (candidate: Candidate): number | null => {
  if (candidate.rankings.length === 0) return null;
  return candidate.rankings[0]?.score ?? null;
};

/**
 * Returns a Tailwind badge style based on the ranking score
 */
const getScoreBadgeStyle = (score: number): string => {
  if (score >= 80) return 'bg-green-100 text-green-800';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  onRefresh,
}) => {
  if (candidates.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">All Candidates</h2>
          <button
            type="button"
            onClick={onRefresh}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            aria-label="Refresh candidates list"
          >
            Refresh
          </button>
        </div>
        <p className="text-gray-500 text-center py-8">
          No candidates yet. Add one using the form.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          All Candidates ({candidates.length})
        </h2>
        <button
          type="button"
          onClick={onRefresh}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          aria-label="Refresh candidates list"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left" aria-label="Candidates table">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-2 text-sm font-medium text-gray-500">Name</th>
              <th className="py-3 px-2 text-sm font-medium text-gray-500">Email</th>
              <th className="py-3 px-2 text-sm font-medium text-gray-500">Experience</th>
              <th className="py-3 px-2 text-sm font-medium text-gray-500">Skills</th>
              <th className="py-3 px-2 text-sm font-medium text-gray-500">Score</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => {
              const score = getLatestScore(candidate);
              return (
                <tr
                  key={candidate.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-2">
                    <span className="font-medium text-gray-900">
                      {candidate.firstName} {candidate.lastName}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-600">
                    {candidate.email}
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-600">
                    {candidate.yearsOfExp} years
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.map((cs) => (
                        <span
                          key={cs.skillId}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {cs.skill.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    {score !== null ? (
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-semibold rounded-full',
                          getScoreBadgeStyle(score)
                        )}
                      >
                        {score}/100
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Unranked</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
