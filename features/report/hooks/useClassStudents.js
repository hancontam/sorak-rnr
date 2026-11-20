import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { assignedClass } from '@/features/auth/utils/class-assignment';

import { getClassStudents, getTransferredStudents } from '../api/report.api';

// withTransferred: chỉ Tổng quan lớp cần thêm danh sách đã chuyển lớp; màn khác không gọi thêm request.
export function useClassStudents({ withTransferred = false } = {}) {
  const user = useAuthStore((state) => state.user);
  const assignment = assignedClass(user);
  const enabled = user?.role === AUTH_ROLES.teacher && Boolean(assignment.classId);
  const query = useQuery({
    queryKey: ['report', user?.id, 'students', assignment.classId],
    queryFn: ({ signal }) => getClassStudents(assignment.classId, signal),
    enabled,
  });
  const transferred = useQuery({
    queryKey: ['report', user?.id, 'transferred', assignment.classId],
    queryFn: ({ signal }) => getTransferredStudents(assignment.classId, signal),
    enabled: enabled && withTransferred,
  });
  return { assignment, query, transferred };
}
