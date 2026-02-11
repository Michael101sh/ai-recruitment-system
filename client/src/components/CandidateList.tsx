import { cn } from '../utils/cn';
import type { Candidate } from '../types';

interface CandidateListProps {
  candidates: Candidate[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onViewCV: (candidate: Candidate) => void;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  selectedIds,
  onToggleSelect,
  onViewCV,
}) => {
  if (candidates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No candidates yet. Add one using the form above.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Candidates ({candidates.length})
      </h2>

      <div className="grid gap-4">
        {candidates.map((candidate) => {
          const isSelected = selectedIds.includes(candidate.id);
          return (
            <div
              key={candidate.id}
              className={cn(
                'p-4 bg-white rounded-lg shadow-sm border-2 transition-colors',
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(candidate.id)}
                    className="mt-1 h-4 w-4 text-blue-600 rounded"
                    aria-label={`Select ${candidate.firstName} ${candidate.lastName}`}
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {candidate.firstName} {candidate.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{candidate.email}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {candidate.yearsOfExp} years of experience
                    </p>
                    {candidate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {candidate.skills.map((cs) => (
                          <span
                            key={cs.skillId}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {cs.skill.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {candidate.cvs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onViewCV(candidate)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    aria-label={`View CV for ${candidate.firstName} ${candidate.lastName}`}
                  >
                    View CV
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
