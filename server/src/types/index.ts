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

// ── Batch Generation Schemas ─────────────────────────────────────────

export const GenerateCandidatesSchema = z.object({
  count: z
    .number()
    .int()
    .min(1, 'Must generate at least 1 candidate')
    .max(10, 'Maximum 10 candidates at once'),
});

export type GenerateCandidatesInput = z.infer<typeof GenerateCandidatesSchema>;

// ── Ranking Schemas ──────────────────────────────────────────────────

export const RankCandidatesSchema = z.object({
  criteria: z
    .string()
    .max(500, 'Criteria must be 500 characters or fewer')
    .optional()
    .default('Software Engineering Position'),
});

export type RankCandidatesInput = z.infer<typeof RankCandidatesSchema>;

// ── Pagination Schemas ───────────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(100),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

// ── Generated Profile (from AI) ──────────────────────────────────────

export interface GeneratedCandidateProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  yearsOfExp: number;
  skills: string[];
}

// ── CV Generation Result ─────────────────────────────────────────────

export interface CVGenerationResult {
  candidateId: string;
  cvId: string;
  content: string;
}

export interface BatchGenerationResult {
  generated: number;
  candidates: Array<{
    candidateId: string;
    name: string;
    cvId: string;
  }>;
}

// ── Ranking Result from AI ───────────────────────────────────────────

export interface RankingResult {
  id: string;
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
    details?: Array<{ field: string; message: string }>;
  };
}
