import { apiClient } from '@/shared/api/client';

import { getTeacherTimetable } from './timetable.api';

function readData(response) {
  if (response.data?.success !== true || !response.data.data) {
    throw new Error('Hệ thống chưa xác nhận thao tác.');
  }
  return response.data.data;
}

function classPath(module, classId, action) {
  return `/${module}/classes/${encodeURIComponent(classId)}/${action}`;
}

function validateStudents(students) {
  if (
    !Array.isArray(students) ||
    students.some((student) => !student?.id) ||
    new Set(students.map((student) => String(student.id))).size !== students.length
  ) {
    throw new Error('Danh sách học sinh thiếu hoặc trùng mã. Không thể ghi nhận an toàn.');
  }
  return students;
}

export async function getDismissalStudents({ classId, date, signal }) {
  const data = readData(
    await apiClient.get(classPath('attendance', classId, 'dismissal'), {
      params: { date },
      signal,
    })
  );
  if (data.date !== date || String(data.classInfo?.id) !== String(classId)) {
    throw new Error('Danh sách đón trẻ không khớp lớp hoặc ngày đã chọn.');
  }
  const students = validateStudents(data.students);
  const attendanceStatuses = ['PRESENT', 'EXCUSED_ABSENCE', 'UNEXCUSED_ABSENCE'];
  if (
    students.some(
      (student) =>
        typeof student.isAttendanceRecorded !== 'boolean' ||
        typeof student.isPresent !== 'boolean' ||
        typeof student.isDismissed !== 'boolean' ||
        (student.isAttendanceRecorded && !attendanceStatuses.includes(student.attendanceStatus)) ||
        student.isPresent !== (student.attendanceStatus === 'PRESENT') ||
        !Array.isArray(student.parents) ||
        !Array.isArray(student.authorizations)
    )
  ) {
    throw new Error(
      'Danh sách đón trẻ thiếu trạng thái hoặc người đón. Hãy tải lại trước khi ghi nhận.'
    );
  }
  return students;
}

export async function getDailyRecords({
  kind,
  classId,
  date,
  slot,
  signal,
  loadTimetable = () => getTeacherTimetable({ classId, date, signal }),
}) {
  if (kind === 'pickup') {
    return getDismissalStudents({ classId, date, signal });
  }

  // Gọi lịch và dữ liệu ghi nhận song song (trước đây chờ lịch xong mới gọi tiếp), rồi mới đối chiếu.
  const recordsRequest =
    kind === 'assessment'
      ? apiClient.get(classPath('assessment', classId, 'records'), {
          params: { date, slotId: slot.id, activityId: slot.activityId },
          signal,
        })
      : getDismissalStudents({ classId, date, signal });
  const [timetable, recordsResult] = await Promise.all([loadTimetable(), recordsRequest]);
  if (!Array.isArray(timetable.students)) throw new Error('Lịch chưa có danh sách học sinh.');
  const students = validateStudents(timetable.students.filter((student) => !student.isTransferred));
  if (kind !== 'assessment') {
    const attendance = recordsResult;
    const byId = new Map(attendance.map((student) => [String(student.id), student]));
    return students.map((student) => {
      const recorded = byId.get(String(student.id));
      if (!recorded || typeof recorded.isAttendanceRecorded !== 'boolean') {
        throw new Error('Chưa xác định được trạng thái điểm danh của từng học sinh.');
      }
      return {
        ...student,
        rawStatus: recorded.attendanceStatus,
        isAttendanceRecorded: recorded.isAttendanceRecorded,
      };
    });
  }

  if (
    !timetable.slots.some(
      (item) =>
        String(item.id) === slot.id &&
        item.fullDate === date &&
        String(item.activityId) === String(slot.activityId)
    )
  ) {
    throw new Error('Hoạt động đã thay đổi. Hãy mở lại từ thời khóa biểu.');
  }
  const data = readData(recordsResult);
  if (!Array.isArray(data.records))
    throw new Error('Danh sách kết quả đánh giá chưa đúng định dạng.');
  if (
    data.records.some((record) => !record.studentId) ||
    new Set(data.records.map((record) => String(record.studentId))).size !== data.records.length
  ) {
    throw new Error('Kết quả đánh giá thiếu hoặc trùng mã học sinh.');
  }
  const results = new Map(data.records.map((record) => [String(record.studentId), record]));
  return students.map((student) => ({ ...student, assessment: results.get(String(student.id)) }));
}

export async function saveDailyRecords({ kind, classId, date, slot, records }) {
  const [module, action, countKey] = {
    attendance: ['attendance', 'records', 'updatedCount'],
    health: ['student-health', 'records', 'savedCount'],
    pickup: ['attendance', 'dismissal', 'updatedCount'],
    assessment: ['assessment', 'records', 'savedCount'],
  }[kind];
  const body = { date, records };
  if (kind === 'assessment') Object.assign(body, { slotId: slot.id, activityId: slot.activityId });

  const data = readData(await apiClient.post(classPath(module, classId, action), body));
  if (!Number.isInteger(data[countKey]) || data[countKey] < 0 || data[countKey] > records.length) {
    throw new Error(
      'Hệ thống chưa xác nhận đủ các mục vừa lưu. Hãy tải lại để kiểm tra trước khi lưu tiếp.'
    );
  }
  // Counts alone cannot prove which child was saved. The hook reads each record back.
  return data;
}
