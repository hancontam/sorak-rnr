import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { assignedClass } from '@/features/auth/utils/class-assignment';

import { getClassStudents } from '../api/report.api';

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
