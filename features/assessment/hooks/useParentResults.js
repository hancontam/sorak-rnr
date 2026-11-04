import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  fetchParentResults,
  saveSemesterAssessment,
  submitParentFeedback,
} from '@/features/assessment/api/assessment.api';

// Phụ huynh: một query chung cho cả sổ liên lạc và đánh giá học kỳ của con.
export function useParentResults(params = {}) {
  const accountId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: ['assessment', 'parent-results', accountId, params],
    queryFn: () => fetchParentResults(params),
    enabled: Boolean(accountId),
    staleTime: 60 * 1000,
  });
}

export function useParentFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitParentFeedback,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assessment', 'parent-results'] }),
  });
}

export function useSaveSemesterNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveSemesterAssessment,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['assessment', 'semester', variables.classId, variables.semester],
      });
    },
  });
}
