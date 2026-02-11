import axios from 'axios';

import type {
  ApiResponse,
  Candidate,
  CandidateInput,
  Ranking,
  RankCandidatesInput,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export const candidateApi = {
  create: async (data: CandidateInput): Promise<Candidate> => {
    const response = await api.post<ApiResponse<Candidate>>('/candidates', data);
    return response.data.data;
  },

  getAll: async (): Promise<Candidate[]> => {
    const response = await api.get<ApiResponse<Candidate[]>>('/candidates');
    return response.data.data;
  },

  getById: async (id: string): Promise<Candidate> => {
    const response = await api.get<ApiResponse<Candidate>>(`/candidates/${id}`);
    return response.data.data;
  },
};

export const rankingApi = {
  rankCandidates: async (data: RankCandidatesInput): Promise<Ranking[]> => {
    const response = await api.post<ApiResponse<Ranking[]>>('/rankings', data);
    return response.data.data;
  },

  getAll: async (): Promise<Ranking[]> => {
    const response = await api.get<ApiResponse<Ranking[]>>('/rankings');
    return response.data.data;
  },
};
