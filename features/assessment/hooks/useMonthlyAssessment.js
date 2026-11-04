import { useQuery } from '@tanstack/react-query';
import { fetchMonthlyAssessment } from '@/features/assessment/api/assessment.api';

export function useMonthlyAssessment({ classId, month, year }) {
  return useQuery({
    queryKey: ['assessment', 'monthly', classId, month, year],
    queryFn: () => fetchMonthlyAssessment({ classId, month, year }),
    enabled: Boolean(classId),
    staleTime: 60 * 1000,
  });
}
