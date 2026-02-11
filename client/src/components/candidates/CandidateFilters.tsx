type SortOption = 'score-desc' | 'score-asc' | 'name-asc' | 'name-desc' | 'exp-desc' | 'exp-asc';

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'score-desc', label: 'Score: High to Low' },
  { value: 'score-asc', label: 'Score: Low to High' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
  { value: 'exp-desc', label: 'Experience: Most' },
  { value: 'exp-asc', label: 'Experience: Least' },
];

interface CandidateFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  totalCandidates: number;
  filteredCount: number;
}

export type { SortOption };

export const CandidateFilters: React.FC<CandidateFiltersProps> = ({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  totalCandidates,
  filteredCount,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field !pl-9 !py-2 text-sm"
            placeholder="Search by name, email, or skill..."
            aria-label="Search candidates"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
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
          onChange={(e) => onSortChange(e.target.value as SortOption)}
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
          Showing {filteredCount} of {totalCandidates} candidates
        </p>
      )}
    </div>
  );
};
