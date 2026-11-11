import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { assignedClass } from '@/features/auth/utils/class-assignment';

import { getParentTimetable, getTeacherTimetable } from '../api/timetable.api';
import { calendarDate } from '../utils/schedule-date';

export function useTimetable(date) {
  const user = useAuthStore((state) => state.user);
  const isParent = user?.role === AUTH_ROLES.parent;
  const isTeacher = user?.role === AUTH_ROLES.teacher;
  const assignment = isTeacher ? assignedClass(user) : {};
  const studentId = user?.student?.id;
  const error = !calendarDate(date)
    ? 'Ngày xem lịch không hợp lệ.'
    : isTeacher
      ? assignment.error
      : isParent && !studentId
        ? 'Tài khoản chưa được liên kết với hồ sơ trẻ.'
        : !isParent && !isTeacher
          ? 'Tài khoản không có quyền xem lịch mobile.'
          : '';
  const query = useQuery({
    queryKey: ['timetable', user?.id, user?.role, isParent ? studentId : assignment.classId, date],
    queryFn: ({ signal }) =>
      isParent
        ? getParentTimetable({ studentId, date, signal })
        : getTeacherTimetable({ classId: assignment.classId, date, signal }),
    enabled: !error && (isParent ? Boolean(studentId) : isTeacher && Boolean(assignment.classId)),
  });
  const noClass = isTeacher && !error && !assignment.classId;
  return { query, error, isParent, noClass };
}
