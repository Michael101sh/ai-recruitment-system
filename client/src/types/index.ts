// ── Candidate Types ──────────────────────────────────────────────────

export interface CandidateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  yearsOfExp: number;
  summary?: string;
  skills: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface CandidateSkill {
  id: string;
  candidateId: string;
  skillId: string;
  skill: Skill;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  yearsOfExp: number;
  summary: string | null;
  generatedCV: string | null;
  createdAt: string;
  updatedAt: string;
  skills: CandidateSkill[];
  rankings: Ranking[];
}

// ── Ranking Types ────────────────────────────────────────────────────

export type RankPriority = 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_ELIGIBLE';

export interface Ranking {
  id: string;
  candidateId: string;
  score: number;
  priority: RankPriority;
  reasoning: string;
  isEligible: boolean;
  createdAt: string;
  candidate?: Candidate;
}

export interface RankCandidatesInput {
  jobDescription: string;
  candidateIds: string[];
}

// ── API Response Types ───────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: {
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}
