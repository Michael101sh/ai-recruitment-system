import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { rankingApi } from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';
import { candidateKeys, rankingKeys } from './queryKeys';

// ── Hooks ──────────────────────────────────────────────────────────────

export function useInterviewList() {
  return useQuery({
    queryKey: rankingKeys.interviewList(),
    queryFn: () => rankingApi.getInterviewList(),
  });
}

export function useRankAll(
  onError?: (message: string) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (criteria?: string) => rankingApi.rankAll(criteria),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rankingKeys.interviewList() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.all });
    },
    onError: (err: unknown) => {
      onError?.(getApiErrorMessage(err, 'Failed to rank candidates. Please try again.'));
    },
  });
}
