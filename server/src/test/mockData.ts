import type { Candidate, CV, Ranking, Skill } from '@prisma/client';

export const createMockCandidate = (overrides?: Partial<Candidate>): Candidate => ({
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '123-456-7890',
  yearsOfExp: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockCV = (overrides?: Partial<CV>): CV => ({
  id: 'cv1',
  candidateId: '1',
  content: '# John Doe\n\nExperienced developer...',
  generatedBy: 'claude-sonnet-4',
  prompt: 'Generate CV for...',
  createdAt: new Date(),
  ...overrides,
});

export const createMockRanking = (overrides?: Partial<Ranking>): Ranking => ({
  id: 'r1',
  candidateId: '1',
  score: 75,
  reasoning: 'Good technical skills',
  criteria: 'Senior Engineer',
  shouldInterview: true,
  priority: 1,
  rankedAt: new Date(),
  ...overrides,
});

export const createMockSkill = (overrides?: Partial<Skill>): Skill => ({
  id: 's1',
  name: 'React',
  category: 'technical',
  ...overrides,
});
