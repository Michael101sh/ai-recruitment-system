import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { candidateApi } from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';
import type { BatchGenerationResult } from '../types';

// ── Query keys ───────────────────────────────────────────────────────

export const candidateKeys = {
  all: ['candidates'] as const,
};

// ── Hooks ──────────────────────────────────────────────────────────────

export function useCandidates() {
  return useQuery({
    queryKey: candidateKeys.all,
    queryFn: () => candidateApi.getAll(),
  });
}

export function useGenerateCandidates(
  onSuccess?: (result: BatchGenerationResult) => void,
  onError?: (message: string) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (count: number) => candidateApi.generate(count),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.all });
      onSuccess?.(result);
    },
    onError: (err: unknown) => {
      onError?.(getApiErrorMessage(err, 'Failed to generate candidates. Please try again.'));
    },
  });
}
