import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveMonthlyAssessment } from '@/features/assessment/api/assessment.api';

export function useSaveMonthlyAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveMonthlyAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment', 'monthly'] });
    },
  });
}
