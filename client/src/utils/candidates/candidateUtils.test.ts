import { describe, it, expect } from 'vitest';
import { filterCandidates, sortCandidates } from './candidateUtils';
import type { Candidate } from '../../types';

const createMockCandidate = (overrides: Partial<Candidate>): Candidate => ({
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '123-456-7890',
  yearsOfExp: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  skills: [],
  cvs: [],
  rankings: [],
  ...overrides,
});

describe('candidateUtils', () => {
  describe('filterCandidates', () => {
    const candidates: Candidate[] = [
      createMockCandidate({
        id: '1',
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        skills: [
          { candidateId: '1', skillId: 's1', level: 5, skill: { id: 's1', name: 'React', category: 'technical' } },
        ],
      }),
      createMockCandidate({
        id: '2',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@test.com',
        skills: [
          { candidateId: '2', skillId: 's2', level: 5, skill: { id: 's2', name: 'Python', category: 'technical' } },
        ],
      }),
    ];

    it('returns all candidates when query is empty', () => {
      expect(filterCandidates(candidates, '')).toEqual(candidates);
      expect(filterCandidates(candidates, '   ')).toEqual(candidates);
    });

    it('filters by first name (case-insensitive)', () => {
      const result = filterCandidates(candidates, 'alice');
      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe('Alice');
    });

    it('filters by last name (case-insensitive)', () => {
      const result = filterCandidates(candidates, 'johnson');
      expect(result).toHaveLength(1);
      expect(result[0].lastName).toBe('Johnson');
    });

    it('filters by email', () => {
      const result = filterCandidates(candidates, 'test.com');
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('bob@test.com');
    });

    it('filters by skill name', () => {
      const result = filterCandidates(candidates, 'react');
      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe('Alice');
    });

    it('returns empty array when no matches', () => {
      const result = filterCandidates(candidates, 'nonexistent');
      expect(result).toHaveLength(0);
    });
  });

  describe('sortCandidates', () => {
    const candidates: Candidate[] = [
      createMockCandidate({
        id: '1',
        firstName: 'Charlie',
        lastName: 'Brown',
        yearsOfExp: 3,
        rankings: [{ id: 'r1', candidateId: '1', score: 70, reasoning: '', criteria: '', shouldInterview: true, priority: 1, rankedAt: new Date().toISOString(), candidate: null as any }],
      }),
      createMockCandidate({
        id: '2',
        firstName: 'Alice',
        lastName: 'Anderson',
        yearsOfExp: 10,
        rankings: [{ id: 'r2', candidateId: '2', score: 90, reasoning: '', criteria: '', shouldInterview: true, priority: 2, rankedAt: new Date().toISOString(), candidate: null as any }],
      }),
      createMockCandidate({
        id: '3',
        firstName: 'Bob',
        lastName: 'Smith',
        yearsOfExp: 1,
        rankings: [],
      }),
    ];

    it('sorts by score descending', () => {
      const result = sortCandidates(candidates, 'score-desc');
      expect(result[0].id).toBe('2'); // 90 score
      expect(result[1].id).toBe('1'); // 70 score
      expect(result[2].id).toBe('3'); // unranked (-1)
    });

    it('sorts by score ascending', () => {
      const result = sortCandidates(candidates, 'score-asc');
      expect(result[0].id).toBe('3'); // unranked (-1)
      expect(result[1].id).toBe('1'); // 70 score
      expect(result[2].id).toBe('2'); // 90 score
    });

    it('sorts by name ascending', () => {
      const result = sortCandidates(candidates, 'name-asc');
      expect(result[0].firstName).toBe('Alice');
      expect(result[1].firstName).toBe('Bob');
      expect(result[2].firstName).toBe('Charlie');
    });

    it('sorts by name descending', () => {
      const result = sortCandidates(candidates, 'name-desc');
      expect(result[0].firstName).toBe('Charlie');
      expect(result[1].firstName).toBe('Bob');
      expect(result[2].firstName).toBe('Alice');
    });

    it('sorts by experience descending', () => {
      const result = sortCandidates(candidates, 'exp-desc');
      expect(result[0].yearsOfExp).toBe(10);
      expect(result[1].yearsOfExp).toBe(3);
      expect(result[2].yearsOfExp).toBe(1);
    });

    it('sorts by experience ascending', () => {
      const result = sortCandidates(candidates, 'exp-asc');
      expect(result[0].yearsOfExp).toBe(1);
      expect(result[1].yearsOfExp).toBe(3);
      expect(result[2].yearsOfExp).toBe(10);
    });

    it('does not mutate original array', () => {
      const original = [...candidates];
      sortCandidates(candidates, 'name-asc');
      expect(candidates).toEqual(original);
    });
  });
});
