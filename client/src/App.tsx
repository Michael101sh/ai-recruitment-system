import { useState, useEffect, useCallback } from 'react';

import { CandidateForm } from './components/CandidateForm';
import { CandidateList } from './components/CandidateList';
import { RankingPanel } from './components/RankingPanel';
import { CVModal } from './components/CVModal';
import { candidateApi, rankingApi } from './services/api';
import type { Candidate, CandidateInput, Ranking } from './types';

const App: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [cvCandidate, setCvCandidate] = useState<Candidate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isRanking, setIsRanking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    try {
      const data = await candidateApi.getAll();
      setCandidates(data);
    } catch (err) {
      setError('Failed to load candidates. Please try again.');
      console.error('Error fetching candidates:', err);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleCreateCandidate = useCallback(async (data: CandidateInput) => {
    setIsCreating(true);
    setError(null);
    try {
      await candidateApi.create(data);
      setSuccess('Candidate created and CV generated successfully!');
      await candidateApi.getAll().then(setCandidates);
    } catch (err) {
      setError('Failed to create candidate. Please try again.');
      console.error('Error creating candidate:', err);
    } finally {
      setIsCreating(false);
    }
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  }, []);

  const handleViewCV = useCallback((candidate: Candidate) => {
    setCvCandidate(candidate);
  }, []);

  const handleCloseCV = useCallback(() => {
    setCvCandidate(null);
  }, []);

  const handleRankCandidates = useCallback(async (jobDescription: string) => {
    setIsRanking(true);
    setError(null);
    try {
      const results = await rankingApi.rankCandidates({
        jobDescription,
        candidateIds: selectedIds,
      });
      setRankings(results);
      setSuccess('Candidates ranked successfully!');
    } catch (err) {
      setError('Failed to rank candidates. Please try again.');
      console.error('Error ranking candidates:', err);
    } finally {
      setIsRanking(false);
    }
  }, [selectedIds]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            AI Recruitment System
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate CVs and rank candidates with AI
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg" role="status">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <CandidateForm onSubmit={handleCreateCandidate} isLoading={isCreating} />
            <CandidateList
              candidates={candidates}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onViewCV={handleViewCV}
            />
          </div>

          <div>
            <RankingPanel
              selectedCandidateIds={selectedIds}
              rankings={rankings}
              isLoading={isRanking}
              onRank={handleRankCandidates}
            />
          </div>
        </div>
      </main>

      <CVModal candidate={cvCandidate} onClose={handleCloseCV} />
    </div>
  );
};

export default App;
