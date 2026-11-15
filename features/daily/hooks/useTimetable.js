import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { assignedClass } from '@/features/auth/utils/class-assignment';

import { getParentTimetable, getTeacherTimetable } from '../api/timetable.api';
import { calendarDate, weekDates } from '../utils/schedule-date';

// Khóa và hàm tải lịch của một ngày, dùng chung cho Thời khóa biểu, chi tiết hoạt động và Ghi nhận ngày
// để các màn đọc cùng một cache thay vì gọi lại endpoint lịch.
export function timetableQuery(user, date) {
  const isParent = user?.role === AUTH_ROLES.parent;
  const assignment = user?.role === AUTH_ROLES.teacher ? assignedClass(user) : {};
  const studentId = user?.student?.id;
  return {
    queryKey: ['timetable', user?.id, user?.role, isParent ? studentId : assignment.classId, date],
    queryFn: ({ signal }) =>
      isParent
        ? getParentTimetable({ studentId, date, signal })
        : getTeacherTimetable({ classId: assignment.classId, date, signal }),
  };
}

function sameWeek(a, b) {
  return Boolean(calendarDate(a) && calendarDate(b)) && weekDates(a)[0] === weekDates(b)[0];
}

export function useTimetable(date, { prefetchWeek = false } = {}) {
  const user = useAuthStore((state) => state.user);
  const client = useQueryClient();
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
  const enabled =
    !error && (isParent ? Boolean(studentId) : isTeacher && Boolean(assignment.classId));
  const options = timetableQuery(user, date);
  const query = useQuery({
    ...options,
    enabled,
    // Đổi ngày trong cùng tuần: giữ lịch đang xem (slot cả tuần giống nhau) trong lúc tải số liệu
    // của ngày mới, thay vì xóa trắng màn. Khác tuần hoặc khác tài khoản thì không giữ.
    placeholderData: (previous, previousQuery) => {
      const key = previousQuery?.queryKey;
      if (!previous || !key) return undefined;
      const sameOwner = key.slice(0, 4).every((part, index) => part === options.queryKey[index]);
      return sameOwner && sameWeek(key[4], date) ? previous : undefined;
    },
  });

  // Tải sẵn các ngày còn lại của tuần để chuyển ngày gần như tức thì (mỗi ngày khoảng 36 KB).
  const weekStart = calendarDate(date) ? weekDates(date)[0] : null;
  useEffect(() => {
    if (!prefetchWeek || !enabled || !weekStart) return;
    for (const day of weekDates(weekStart)) {
      if (day !== date) client.prefetchQuery(timetableQuery(user, day));
    }
    // Chỉ chạy lại khi đổi tuần hoặc đổi tài khoản; đổi ngày trong tuần đã có cache.
  }, [prefetchWeek, enabled, weekStart, user, client]);

  const noClass = isTeacher && !error && !assignment.classId;
  return { query, error, isParent, noClass };
}
