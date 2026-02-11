import { useState, useMemo, useCallback } from 'react';

import { VirtualList } from '../shared';
import { CandidateCard } from './CandidateCard';
import { CandidateFilters, type SortOption } from './CandidateFilters';
import { useDeleteCandidate } from '../../hooks/candidates';
import { useAppStore } from '../../store/useAppStore';
import { filterCandidates, sortCandidates } from '../../utils/candidates';
import type { Candidate } from '../../types';

interface CandidateListProps {
  candidates: Candidate[];
  onRefresh: () => void;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  onRefresh,
}) => {
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

  const renderCandidate = useCallback((candidate: Candidate, index: number) => (
    <CandidateCard
      candidate={candidate}
      index={index}
      onDelete={handleDelete}
      isDeleting={deleteMutation.isPending}
    />
  ), [handleDelete, deleteMutation.isPending]);

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
        <CandidateFilters
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalCandidates={candidates.length}
          filteredCount={filtered.length}
        />
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
