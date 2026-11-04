import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchParentResults,
  saveSemesterAssessment,
  submitParentFeedback,
} from '@/features/assessment/api/assessment.api';

// Phụ huynh: một query chung cho cả sổ liên lạc và đánh giá học kỳ của con.
export function useParentResults() {
  return useQuery({
    queryKey: ['assessment', 'parent-results'],
    queryFn: fetchParentResults,
    staleTime: 60 * 1000,
  });
}

export function useParentFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitParentFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment', 'parent-results'] });
    },
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
