import axios from 'axios';

import type {
  ApiResponse,
  BatchGenerationResult,
  Candidate,
  InterviewListResponse,
  Ranking,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Auth interceptor ──────────────────────────────────────────────────
// When VITE_API_KEY is set the client attaches it as an x-api-key header.
// In development this is typically left unset (auth is skipped server-side).
api.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (apiKey) {
    config.headers['x-api-key'] = apiKey;
  }
  return config;
});

// ── Candidate API ─────────────────────────────────────────────────────

export const candidateApi = {
  generate: async (count: number): Promise<BatchGenerationResult> => {
    const response = await api.post<ApiResponse<BatchGenerationResult>>(
      '/candidates/generate',
      { count },
    );
    return response?.data?.data;
  },

  getAll: async (): Promise<Candidate[]> => {
    const response = await api.get<{ data: Candidate[] }>('/candidates');
    return response?.data?.data;
  },

  delete: async (candidateId: string): Promise<void> => {
    await api.delete(`/candidates/${candidateId}`);
  },
};

// ── Ranking API ───────────────────────────────────────────────────────

export const rankingApi = {
  rankAll: async (criteria?: string): Promise<Ranking[]> => {
    const response = await api.post<ApiResponse<Ranking[]>>('/rankings', {
      criteria,
    });
    return response?.data?.data;
  },

  getInterviewList: async (): Promise<InterviewListResponse> => {
    const response = await api.get<ApiResponse<InterviewListResponse>>(
      '/rankings/interview-list',
    );
    return response?.data?.data;
  },
};
