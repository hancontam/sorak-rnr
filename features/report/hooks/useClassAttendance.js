import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { assignedClass } from '@/features/auth/utils/class-assignment';

import { getClassAttendanceStats } from '../api/report.api';

// Thống kê chuyên cần của lớp giáo viên đang phụ trách cho một kỳ (tháng, học kỳ hoặc cả năm).
export function useClassAttendance(period) {
  const user = useAuthStore((state) => state.user);
  const assignment = assignedClass(user);
  const query = useQuery({
    queryKey: ['report', user?.id, 'class-attendance', assignment.classId, period],
    queryFn: ({ signal }) =>
      getClassAttendanceStats({ classId: assignment.classId, period, signal }),
    enabled: user?.role === AUTH_ROLES.teacher && Boolean(assignment.classId),
  });
  return { assignment, query };
}
