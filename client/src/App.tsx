import { useState, useEffect, useCallback } from 'react';

import { GenerateCandidates } from './components/GenerateCandidates';
import { CandidateList } from './components/CandidateList';
import { RankingDashboard } from './components/RankingDashboard';
import { candidateApi } from './services/api';
import { cn } from './utils/cn';
import { getApiErrorMessage } from './utils/apiError';
import type { Candidate, BatchGenerationResult } from './types';

type Tab = 'generate' | 'candidates' | 'rankings';

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode; description: string }> = [
  {
    id: 'generate',
    label: 'Generate',
    description: 'Create AI candidates',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
      </svg>
    ),
  },
  {
    id: 'candidates',
    label: 'Candidates',
    description: 'View all profiles',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    id: 'rankings',
    label: 'Rankings',
    description: 'Interview decisions',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
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
      setError(getApiErrorMessage(err, 'Failed to load candidates. Please try again.'));
      console.error('Error fetching candidates:', err);
    }
  }, []);

  useEffect(() => {
    handleFetchCandidates();
  }, [handleFetchCandidates]);

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
      const updated = await candidateApi.getAll();
      setCandidates(updated);
      return result;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to generate candidates. Please try again.'));
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
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* ─── Header ─── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-600 to-indigo-600 flex-shrink-0">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-400/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              AI Recruitment System
            </h1>
          </div>
          <p className="text-purple-200 text-sm ml-[52px]">
            Generate candidate profiles, CVs, and intelligent rankings — powered by Claude AI
          </p>
        </div>

        {/* ─── Tab Navigation ─── */}
        <nav className="relative max-w-7xl mx-auto px-6" aria-label="Main navigation">
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
                  'group flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-xl transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-white text-violet-700 shadow-sm'
                    : 'text-white hover:bg-white/15'
                )}
              >
                <span className={cn(
                  'transition-colors duration-200',
                  activeTab === tab.id ? 'text-violet-500' : 'text-white'
                )}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-6 py-8 overflow-hidden">
        {/* Notification Toasts */}
        {error && (
          <div className="mb-6 flex-shrink-0 flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl animate-fade-in" role="alert">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-100">
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 flex-shrink-0 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl animate-fade-in" role="status">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        <div
          id="panel-generate"
          role="tabpanel"
          aria-labelledby="tab-generate"
          className={activeTab === 'generate' ? 'flex-1 overflow-y-auto animate-fade-in' : 'hidden'}
        >
          <GenerateCandidates onGenerate={handleGenerate} isLoading={isGenerating} />
        </div>

        <div
          id="panel-candidates"
          role="tabpanel"
          aria-labelledby="tab-candidates"
          className={activeTab === 'candidates' ? 'flex-1 flex flex-col overflow-hidden animate-fade-in' : 'hidden'}
        >
          <CandidateList candidates={candidates} onRefresh={handleFetchCandidates} />
        </div>

        <div
          id="panel-rankings"
          role="tabpanel"
          aria-labelledby="tab-rankings"
          className={activeTab === 'rankings' ? 'flex-1 flex flex-col overflow-hidden animate-fade-in' : 'hidden'}
        >
          <RankingDashboard onRankingComplete={handleFetchCandidates} totalCandidates={candidates.length} />
        </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="flex-shrink-0 border-t border-gray-200/60 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            AI Recruitment System &middot; Powered by Claude AI
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-gray-400">System Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
