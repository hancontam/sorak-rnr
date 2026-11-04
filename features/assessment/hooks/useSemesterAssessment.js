import { useQuery } from '@tanstack/react-query';
import { fetchSemesterAssessment } from '@/features/assessment/api/assessment.api';

export function useSemesterAssessment({ classId, semester }) {
  return useQuery({
    queryKey: ['assessment', 'semester', classId, semester],
    queryFn: () => fetchSemesterAssessment({ classId, semester }),
    enabled: Boolean(classId),
    staleTime: 60 * 1000,
  });
}
