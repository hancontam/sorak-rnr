import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';

import { getParentReport, getStudentReport } from '../api/report.api';
import { assignedClass } from '../utils/report-format';

export function useStudentReport(studentId, semester) {
  const user = useAuthStore((state) => state.user);
  const assignment = assignedClass(user);
  const query = useQuery({
    queryKey: ['report', user?.id, 'student', assignment.classId, studentId, semester],
    queryFn: ({ signal }) =>
      getStudentReport({ classId: assignment.classId, studentId, semester, signal }),
    enabled: user?.role === AUTH_ROLES.teacher && Boolean(assignment.classId && studentId),
  });
  return {
    query,
    error:
      assignment.error ||
      (!assignment.classId
        ? 'Bạn chưa được phân công lớp.'
        : !studentId
          ? 'Thiếu mã học sinh.'
          : ''),
  };
}

export function useParentReport(semester) {
  const user = useAuthStore((state) => state.user);
  const studentId = user?.student?.id;
  const query = useQuery({
    queryKey: ['report', user?.id, 'own-child', studentId, semester],
    queryFn: ({ signal }) => getParentReport({ studentId, semester, signal }),
    enabled: user?.role === AUTH_ROLES.parent && Boolean(studentId),
  });
  return {
    query,
    error: studentId
      ? ''
      : 'Tài khoản chưa được liên kết với hồ sơ trẻ. Vui lòng liên hệ nhà trường.',
  };
}
