interface RankingFormProps {
  criteria: string;
  onCriteriaChange: (value: string) => void;
  onRankAll: () => void;
  isRanking: boolean;
}

export const RankingForm: React.FC<RankingFormProps> = ({
  criteria,
  onCriteriaChange,
  onRankAll,
  isRanking,
}) => {
  return (
    <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        value={criteria}
        onChange={(e) => onCriteriaChange(e.target.value)}
        className="input-field flex-1 !py-2 text-sm"
        placeholder="Criteria, e.g. Senior Full-Stack Engineer, React & Node.js"
        aria-label="Ranking criteria"
      />
      <button
        type="button"
        onClick={onRankAll}
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
  );
};
