import { z } from 'zod';

// ── Candidate Schemas ────────────────────────────────────────────────

export const CandidateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  yearsOfExp: z.number().int().min(0, 'Years of experience must be non-negative'),
  summary: z.string().optional(),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

export type CandidateInput = z.infer<typeof CandidateSchema>;

// ── Ranking Schemas ──────────────────────────────────────────────────

export const RankCandidatesSchema = z.object({
  jobDescription: z.string().min(10, 'Job description must be at least 10 characters'),
  candidateIds: z.array(z.string().uuid()).min(1, 'At least one candidate is required'),
});

export type RankCandidatesInput = z.infer<typeof RankCandidatesSchema>;

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

// ── Ranking Result from AI ───────────────────────────────────────────

export const RankingResultSchema = z.object({
  candidateId: z.string().uuid(),
  score: z.number().min(0).max(100),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW', 'NOT_ELIGIBLE']),
  reasoning: z.string(),
  isEligible: z.boolean(),
});

export type RankingResult = z.infer<typeof RankingResultSchema>;
