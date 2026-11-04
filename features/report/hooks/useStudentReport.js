import { useQuery } from '@tanstack/react-query';
import { getStudentDetail, getStudentReport } from '@/features/report/api/report.api';

export function useStudentReport(classId, studentId) {
  const enabled = Boolean(classId && studentId);
  const detail = useQuery({
    queryKey: ['student-detail', studentId],
    queryFn: () => getStudentDetail(studentId),
    enabled,
  });
  const report = useQuery({
    queryKey: ['student-report', classId, studentId],
    queryFn: () => getStudentReport(classId, studentId),
    enabled,
  });

  return {
    student: detail.data || report.data?.student,
    report: report.data,
    isLoading: detail.isPending || report.isPending,
    isRefreshing: detail.isRefetching || report.isRefetching,
    error: detail.error || report.error,
    refetch: () => Promise.all([detail.refetch(), report.refetch()]),
  };
}
