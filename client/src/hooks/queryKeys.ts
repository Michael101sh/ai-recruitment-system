/**
 * Centralized query keys for TanStack Query.
 * Prevents circular dependencies between hooks.
 */

export const candidateKeys = {
  all: ['candidates'] as const,
};

export const rankingKeys = {
  all: ['rankings'] as const,
  interviewList: () => [...rankingKeys.all, 'interview-list'] as const,
};
