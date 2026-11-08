import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';

import { getClassStudents } from '../api/report.api';
import { assignedClass } from '../utils/report-format';

export function useClassStudents() {
  const user = useAuthStore((state) => state.user);
  const assignment = assignedClass(user);
  const query = useQuery({
    queryKey: ['report', user?.id, 'students', assignment.classId],
    queryFn: ({ signal }) => getClassStudents(assignment.classId, signal),
    enabled: user?.role === AUTH_ROLES.teacher && Boolean(assignment.classId),
  });
  return { assignment, query };
}
