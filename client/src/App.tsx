import { useState, useEffect, useCallback } from 'react';

import { CandidateForm } from './components/CandidateForm';
import { CVDisplay } from './components/CVDisplay';
import { CandidateList } from './components/CandidateList';
import { RankingDashboard } from './components/RankingDashboard';
import { candidateApi } from './services/api';
import { cn } from './utils/cn';
import type { Candidate, CandidateInput } from './types';

type Tab = 'add' | 'candidates' | 'rankings';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'add', label: 'Add Candidate' },
  { id: 'candidates', label: 'All Candidates' },
  { id: 'rankings', label: 'Rankings' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('add');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [latestCV, setLatestCV] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFetchCandidates = useCallback(async () => {
    try {
      const data = await candidateApi.getAll();
      setCandidates(data);
    } catch (err) {
      setError('Failed to load candidates. Please try again.');
      console.error('Error fetching candidates:', err);
    }
  }, []);

  useEffect(() => {
    handleFetchCandidates();
  }, [handleFetchCandidates]);

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
    setLatestCV(null);
    try {
      const result = await candidateApi.create(data);
      setLatestCV(result.content);
      setSuccess('Candidate created and CV generated successfully!');
      // Refresh the candidates list in the background
      const updated = await candidateApi.getAll();
      setCandidates(updated);
    } catch (err) {
      setError('Failed to create candidate. Please try again.');
      console.error('Error creating candidate:', err);
    } finally {
      setIsCreating(false);
    }
  }, []);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
  }, []);

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

      <nav className="bg-white border-b" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'px-5 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

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

        <div
          id="panel-add"
          role="tabpanel"
          aria-labelledby="tab-add"
          className={activeTab === 'add' ? '' : 'hidden'}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CandidateForm onSubmit={handleCreateCandidate} isLoading={isCreating} />
            <CVDisplay cv={latestCV} isLoading={isCreating} />
          </div>
        </div>

        <div
          id="panel-candidates"
          role="tabpanel"
          aria-labelledby="tab-candidates"
          className={activeTab === 'candidates' ? '' : 'hidden'}
        >
          <CandidateList candidates={candidates} onRefresh={handleFetchCandidates} />
        </div>

        <div
          id="panel-rankings"
          role="tabpanel"
          aria-labelledby="tab-rankings"
          className={activeTab === 'rankings' ? '' : 'hidden'}
        >
          <RankingDashboard />
        </div>
      </main>
    </div>
  );
};

export default App;
