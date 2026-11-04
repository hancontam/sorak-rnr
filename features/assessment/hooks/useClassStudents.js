import { useQuery } from '@tanstack/react-query';
import { fetchAssessmentClassStudents } from '@/features/assessment/api/assessment.api';

export function useClassStudents(classId) {
  return useQuery({
    queryKey: ['assessment', 'class-students', classId],
    queryFn: () => fetchAssessmentClassStudents(classId),
    enabled: Boolean(classId),
    staleTime: 5 * 60 * 1000,
  });
}
