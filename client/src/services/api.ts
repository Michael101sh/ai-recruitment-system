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
});

export const candidateApi = {
  generate: async (count: number): Promise<BatchGenerationResult> => {
    const response = await api.post<ApiResponse<BatchGenerationResult>>(
      '/candidates/generate',
      { count }
    );
    return response.data.data;
  },

  getAll: async (): Promise<Candidate[]> => {
    const response = await api.get<ApiResponse<Candidate[]>>('/candidates');
    return response.data.data;
  },
};

export const rankingApi = {
  rankAll: async (criteria?: string): Promise<Ranking[]> => {
    const response = await api.post<ApiResponse<Ranking[]>>('/rankings', {
      criteria,
    });
    return response.data.data;
  },

  getInterviewList: async (): Promise<InterviewListResponse> => {
    const response = await api.get<ApiResponse<InterviewListResponse>>(
      '/rankings/interview-list'
    );
    return response.data.data;
  },
};
