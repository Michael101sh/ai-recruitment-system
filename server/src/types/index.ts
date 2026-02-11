import { z } from 'zod';

// ── Candidate Schemas ────────────────────────────────────────────────

export const CandidateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  yearsOfExp: z.number().int().min(0, 'Years of experience must be non-negative'),
  skills: z.array(z.string().min(1)).min(1, 'At least one skill is required'),
});

export type CandidateInput = z.infer<typeof CandidateSchema>;

// ── CV Generation Result ─────────────────────────────────────────────

export interface CVGenerationResult {
  candidateId: string;
  cvId: string;
  content: string;
}

// ── Ranking Result from AI ───────────────────────────────────────────

export interface RankingResult {
  name: string;
  score: number;
  reasoning: string;
  shouldInterview: boolean;
}

// ── API Response Types ───────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: {
    message: string;
    stack?: string;
  };
}
