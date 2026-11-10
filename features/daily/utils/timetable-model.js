import { TEACHER_ROUTINES } from './routine-slots';
import { calendarDate } from './schedule-date';

const plainText = (value) => (typeof value === 'string' ? value : '');
const assessmentLabels = {
  ACHIEVED: 'Đạt',
  NOT_ACHIEVED: 'Chưa đạt',
  OUTSTANDING: 'Vượt trội',
  EXCELLENT: 'Xuất sắc',
};

export function activityStatus(status) {
  return (
    { COMPLETED: 'Đã hoàn thành', PLANNED: 'Đã xếp lịch', SCHEDULED: 'Đã xếp lịch' }[status] || ''
  );
}

export function dayActivities(data, date, isParent) {
  const slots = isParent ? data.timetable.weeklyActivities : data.slots;
  return slots
    .filter((slot) => (isParent ? slot.isoDate : slot.fullDate) === date)
    .map((slot) => ({
      id: String(slot.id),
      activityId: slot.activityId,
      routineKey: slot.routineSlot,
      title: plainText(slot.title) || 'Hoạt động chưa có tên',
      objective: plainText(slot.objective),
      preparation: plainText(slot.preparation),
      procedure: plainText(slot.procedure),
      goal: [slot.goalCode, slot.goalTitle].filter(Boolean).join(' · '),
      criteria: plainText(slot.evaluationCriteria),
      start: plainText(slot.startTime),
      end: plainText(slot.endTime),
      order: Number.isFinite(Number(slot.orderIndex)) ? Number(slot.orderIndex) : 0,
      status: activityStatus(slot.status),
    }))
    .sort(
      (a, b) => a.start.localeCompare(b.start) || a.order - b.order || a.id.localeCompare(b.id)
    );
}

export function dayFrames(data, date, isParent) {
  const activities = dayActivities(data, date, isParent);
  const weekday = calendarDate(date)?.getUTCDay();
  // Do not invent a school day from routine templates on an empty weekend.
  // Real weekend activities remain available to both roles.
  if ((weekday === 0 || weekday === 6) && activities.length === 0) return [];
  const routines = isParent
    ? data.timetable.routineSlots.map((slot) => {
        const [start = '', end = ''] = plainText(slot.time).split(/\s*[–—]\s*/);
        return { key: slot.slot, title: slot.title, start, end };
      })
    : TEACHER_ROUTINES;
  const frames = routines.map((routine) => ({
    ...routine,
    activities: activities.filter((activity) => activity.routineKey === routine.key),
  }));
  // Keep unfamiliar server routine types instead of silently dropping their activities.
  for (const activity of activities) {
    if (!routines.some((routine) => routine.key === activity.routineKey)) {
      frames.push({
        key: `extra:${activity.id}`,
        title: 'Hoạt động khác',
        start: activity.start,
        end: activity.end,
        activities: [activity],
      });
    }
  }
  return frames;
}

function countLabel(count, suffix) {
  return Number.isInteger(count) && count >= 0 ? `${count} ${suffix}` : 'Chưa có thông tin';
}

export function daySummary(data, date, isParent) {
  if (!isParent) {
    const stats = data.stats;
    return {
      attendance:
        stats?.isRecorded === false
          ? 'Chưa ghi nhận'
          : stats?.isRecorded === true
            ? countLabel(stats.presentCount, 'có mặt')
            : 'Chưa có thông tin',
      health:
        stats?.isHealthRecorded === false
          ? 'Chưa ghi nhận'
          : stats?.isHealthRecorded === true
            ? countLabel(stats.healthCount, 'đã đo')
            : 'Chưa có thông tin',
      pickup: countLabel(stats?.dismissedCount, 'đã đón'),
    };
  }
  const attendance = data.attendance.records.find((record) => record.isoDate === date);
  const health = data.health.history.filter((record) => record.rawDate?.slice(0, 10) === date);
  return {
    attendance: attendance
      ? {
          PRESENT: 'Có mặt',
          EXCUSED_ABSENCE: 'Vắng có phép',
          UNEXCUSED_ABSENCE: 'Vắng không phép',
          ABSENT: 'Vắng',
        }[attendance.rawStatus] ||
        attendance.statusLabel ||
        'Đã ghi nhận'
      : 'Chưa ghi nhận',
    health: health.length ? 'Đã có số đo' : 'Chưa ghi nhận',
    pickup: attendance?.checkOutTime ? `Đã đón ${attendance.checkOutTime}` : 'Chưa ghi nhận',
  };
}

export function childDayResults(data, date, routineSlot) {
  // Backend contract: one activity per routineSlot + school calendar date.
  // Assessment IDs and scheduled-activity IDs belong to different resources.
  return data.slotAssessments
    .filter(
      (record) => record.isoDate === date && (!routineSlot || record.routineSlot === routineSlot)
    )
    .map((record) => ({
      id: String(record.id),
      title: plainText(record.activityTitle),
      result: assessmentLabels[record.status] || 'Chưa rõ kết quả',
      note: plainText(record.notes),
      teacher: plainText(record.evaluatorName),
    }));
}

export function timetableError(error) {
  if (error?.response?.status === 403)
    return 'Tài khoản chưa được cấp quyền xem thời khóa biểu này.';
  if (error?.response?.status === 401) return 'Phiên đăng nhập không còn hợp lệ.';
  if (error?.isAxiosError)
    return error.response
      ? 'Chưa tải được lịch từ nhà trường. Vui lòng thử lại.'
      : 'Chưa kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
  return error?.message || 'Chưa tải được thời khóa biểu.';
}
