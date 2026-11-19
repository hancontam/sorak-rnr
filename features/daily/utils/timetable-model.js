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
      title: plainText(slot.title),
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
  // Real weekend activities and Saturday make-up days remain available to both roles.
  if (
    (weekday === 0 || weekday === 6) &&
    activities.length === 0 &&
    !(weekday === 6 && saturdayMakeup(calendarEntries(data), date))
  )
    return [];
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

// Mục lịch năm học áp cho lớp: targetGrades rỗng là toàn trường, có giá trị thì cho mọi lớp thuộc khối.
function calendarEntries(data) {
  const grade = data?.classInfo?.ageGroup;
  return (Array.isArray(data?.holidays) ? data.holidays : []).filter(
    (item) =>
      typeof item?.startDate === 'string' &&
      typeof item?.endDate === 'string' &&
      (!item.targetGrades?.length || !grade || item.targetGrades.includes(grade))
  );
}

// Thứ Bảy là ngày học khi BGH đặt làm ngày dạy bù (makeupDate của một ngày nghỉ) hoặc có sự kiện
// cho dạy phủ ngày đó (cách đánh dấu học bù cũ), giống điều kiện xếp lịch T7 của backend.
function saturdayMakeup(entries, date) {
  return (
    entries.find((item) => item.makeupDate === date) ||
    entries.find(
      (item) => item.isTeachingAllowed === true && item.startDate <= date && date <= item.endDate
    ) ||
    null
  );
}

// Lịch năm học của ngày (theo backend/web):
// - Ngày nghỉ (isTeachingAllowed = false) khóa ghi nhận; slot đã sắp vẫn hiện để xem. Ngày được đặt
//   làm ngày dạy bù không bị khóa. Ngày nghỉ có makeupDate cho biết lịch dạy dời sang Thứ Bảy đó.
// - Thứ Bảy dạy bù là ngày học kể cả khi chưa có slot; makeupOf là ngày nghỉ được bù.
// - T7/CN khác không có hoạt động là ngày nghỉ cuối tuần; có hoạt động thì như ngày thường.
// - Sự kiện vẫn cho dạy chỉ để hiện nhãn. Lịch PH chưa trả holidays (BE-06) nên PH chỉ thấy khóa
//   cuối tuần.
export function dayCalendar(data, date, isParent) {
  const entries = calendarEntries(data);
  const covering = entries.filter((item) => item.startDate <= date && date <= item.endDate);
  const isMakeupDate = entries.some((item) => item.makeupDate === date);
  const holiday = isMakeupDate ? null : covering.find((item) => item.isTeachingAllowed === false);
  const events = covering
    .filter((item) => item.isTeachingAllowed === true)
    .map((item) => plainText(item.name))
    .filter(Boolean);
  if (holiday) {
    return {
      lock: {
        kind: 'holiday',
        name: plainText(holiday.name),
        makeupDate: typeof holiday.makeupDate === 'string' ? holiday.makeupDate : '',
      },
      events,
      makeupOf: '',
    };
  }
  const weekday = calendarDate(date)?.getUTCDay();
  const makeup = weekday === 6 ? saturdayMakeup(entries, date) : null;
  // Chỉ mục có makeupDate mới biết ngày nghỉ gốc; sự kiện học bù cũ chỉ có tên (đã nằm trong events).
  const makeupOf = makeup?.makeupDate === date ? makeup.startDate : '';
  if (
    (weekday === 0 || weekday === 6) &&
    !makeup &&
    dayActivities(data, date, isParent).length === 0
  ) {
    return { lock: { kind: 'weekend', name: '', makeupDate: '' }, events, makeupOf };
  }
  return { lock: null, events, makeupOf, makeup: Boolean(makeup) };
}

export function routineTitle(frame, isParent, t) {
  return isParent && !frame.key.startsWith('extra:') ? frame.title : t(frame.title);
}

const count = (value) => (Number.isInteger(value) && value >= 0 ? value : null);
const recordState = (flag) => (flag === true ? 'done' : flag === false ? 'todo' : 'unknown');

export const ATTENDANCE_LABELS = {
  PRESENT: 'Có mặt',
  EXCUSED_ABSENCE: 'Vắng có phép',
  UNEXCUSED_ABSENCE: 'Vắng không phép',
  ABSENT: 'Vắng',
};

// Tình hình trong ngày từ dữ liệu thật: số liệu thiếu giữ null để UI hiện "Chưa có thông tin".
export function dayOverview(data, date, isParent) {
  if (!isParent) {
    const stats = data.stats || {};
    return {
      total: count(stats.totalStudents),
      attendance: {
        state: recordState(stats.isRecorded),
        present: count(stats.presentCount),
        absent: count(stats.absentCount),
      },
      health: { state: recordState(stats.isHealthRecorded), count: count(stats.healthCount) },
      pickup: { state: recordState(stats.isDismissalRecorded), count: count(stats.dismissedCount) },
    };
  }
  const attendance = data.attendance.records.find((record) => record.isoDate === date);
  const health = data.health.history.filter((record) => record.rawDate?.slice(0, 10) === date);
  const measured = health[health.length - 1];
  return {
    attendance: {
      state: attendance ? 'done' : 'todo',
      label: ATTENDANCE_LABELS[attendance?.rawStatus] || '',
      rawLabel: attendance?.statusLabel || '',
      present: attendance?.rawStatus === 'PRESENT',
      checkIn: plainText(attendance?.checkInTime),
    },
    health: {
      state: health.length ? 'done' : 'todo',
      height: Number.isFinite(measured?.height) && measured.height > 0 ? measured.height : null,
      weight: Number.isFinite(measured?.weight) && measured.weight > 0 ? measured.weight : null,
    },
    pickup: {
      state: attendance?.checkOutTime ? 'done' : 'todo',
      time: attendance?.checkOutTime || '',
      person: plainText(attendance?.pickupPersonName),
    },
  };
}

// Gom các khung trống liên tiếp thành một dòng thu gọn; khung có hoạt động giữ nguyên thứ tự.
export function timelineItems(frames) {
  const items = [];
  let run = [];
  const flush = () => {
    if (run.length) items.push({ key: `empty:${run[0].key}`, type: 'empty', frames: run });
    run = [];
  };
  for (const frame of frames) {
    if (frame.activities.length) {
      flush();
      items.push({ key: frame.key, type: 'frame', frame });
    } else run.push(frame);
  }
  flush();
  return items;
}

export function isCurrentFrame(frame, now) {
  return Boolean(now && frame.start && frame.end && frame.start <= now && now < frame.end);
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
