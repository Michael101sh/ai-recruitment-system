// ── Candidate Types ──────────────────────────────────────────────────

export interface CandidateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  yearsOfExp: number;
  skills: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface CandidateSkill {
  candidateId: string;
  skillId: string;
  level: number;
  skill: Skill;
}

export interface CV {
  id: string;
  candidateId: string;
  content: string;
  generatedBy: string;
  prompt: string | null;
  createdAt: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  yearsOfExp: number;
  createdAt: string;
  updatedAt: string;
  skills: CandidateSkill[];
  cvs: CV[];
  rankings: Ranking[];
}

// ── CV Generation Result ─────────────────────────────────────────────

export interface CVGenerationResult {
  candidateId: string;
  cvId: string;
  content: string;
}

// ── Ranking Types ────────────────────────────────────────────────────

export interface Ranking {
  id: string;
  candidateId: string;
  score: number;
  reasoning: string;
  criteria: string;
  shouldInterview: boolean;
  priority: number;
  rankedAt: string;
  candidate?: Candidate;
}

export interface InterviewListResponse {
  shouldInterview: Ranking[];
  shouldNotInterview: Ranking[];
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
