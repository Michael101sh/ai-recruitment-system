import { useState, useEffect, useCallback } from 'react';

import { GenerateCandidates } from './components/GenerateCandidates';
import { CandidateList } from './components/CandidateList';
import { RankingDashboard } from './components/RankingDashboard';
import { candidateApi } from './services/api';
import { cn } from './utils/cn';
import type { Candidate, BatchGenerationResult } from './types';

type Tab = 'generate' | 'candidates' | 'rankings';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'generate', label: 'Generate Candidates' },
  { id: 'candidates', label: 'All Candidates' },
  { id: 'rankings', label: 'Rankings' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleGenerate = useCallback(async (count: number): Promise<BatchGenerationResult> => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await candidateApi.generate(count);
      setSuccess(`Successfully generated ${result.generated} candidates with CVs!`);
      // Refresh candidates list in the background
      const updated = await candidateApi.getAll();
      setCandidates(updated);
      return result;
    } catch (err) {
      setError('Failed to generate candidates. Please try again.');
      console.error('Error generating candidates:', err);
      throw err;
    } finally {
      setIsGenerating(false);
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
            Generate candidates, CVs, and rank them with AI
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
          id="panel-generate"
          role="tabpanel"
          aria-labelledby="tab-generate"
          className={activeTab === 'generate' ? '' : 'hidden'}
        >
          <GenerateCandidates onGenerate={handleGenerate} isLoading={isGenerating} />
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
