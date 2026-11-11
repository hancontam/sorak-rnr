import { apiClient } from '@/shared/api/client';

import { calendarDate, weekDates } from '../utils/schedule-date';

function readData(response) {
  const body = response.data;
  if (
    body?.success !== true ||
    !body.data ||
    typeof body.data !== 'object' ||
    Array.isArray(body.data)
  ) {
    throw new Error('Máy chủ chưa trả đủ dữ liệu thời khóa biểu.');
  }
  return body.data;
}

function requireRecords(records, label) {
  if (
    !Array.isArray(records) ||
    records.some((item) => !item || typeof item !== 'object' || Array.isArray(item))
  ) {
    throw new Error(`Dữ liệu ${label} chưa đúng định dạng.`);
  }
}

function dateParams(date) {
  const days = weekDates(date);
  return { date, startDate: days[0], endDate: days[6] };
}

export async function getTeacherTimetable({ classId, date, signal }) {
  if (!classId) throw new Error('Chưa có lớp được phân công.');
  const data = readData(
    await apiClient.get(`/attendance/classes/${encodeURIComponent(classId)}/timetable`, {
      params: dateParams(date),
      signal,
    })
  );
  if (String(data.classInfo?.id) !== String(classId)) {
    throw new Error('Lịch trả về không khớp lớp được phân công.');
  }
  if (data.classInfo.selectedDate !== date) {
    throw new Error('Máy chủ trả trạng thái cho ngày khác. Vui lòng tải lại lịch.');
  }
  requireRecords(data.slots, 'hoạt động');
  if (data.slots.some((slot) => !slot.id || !calendarDate(slot.fullDate))) {
    throw new Error('Hoạt động chưa có mã hoặc ngày đầy đủ để hiển thị chính xác.');
  }
  return data;
}

export async function getParentTimetable({ studentId, date, signal }) {
  if (!studentId) throw new Error('Tài khoản chưa được liên kết với hồ sơ trẻ.');
  const data = readData(
    await apiClient.get('/parent/schedule', {
      params: dateParams(date),
      signal,
    })
  );
  if (data.student === null) return data;
  if (
    ![data.student?.id, data.student?.publicId].some((id) => id && String(id) === String(studentId))
  ) {
    throw new Error('Lịch trả về không khớp học sinh của tài khoản.');
  }
  if (data.classInfo === null) return data;
  if (!data.classInfo?.id) throw new Error('Lịch chưa có thông tin lớp học.');
  requireRecords(data.timetable?.routineSlots, 'khung sinh hoạt');
  const routineKeys = data.timetable.routineSlots.map((slot) => slot.slot);
  if (
    routineKeys.some((key) => typeof key !== 'string' || !key.trim()) ||
    new Set(routineKeys).size !== routineKeys.length
  ) {
    throw new Error('Khung sinh hoạt thiếu mã hoặc bị trùng. Vui lòng tải lại lịch.');
  }
  requireRecords(data.timetable?.weeklyActivities, 'hoạt động');
  if (data.timetable.weeklyActivities.some((slot) => !slot.id || !calendarDate(slot.isoDate))) {
    throw new Error('Hoạt động chưa có mã hoặc ngày đầy đủ để hiển thị chính xác.');
  }
  requireRecords(data.attendance?.records, 'điểm danh');
  requireRecords(data.health?.history, 'sức khỏe');
  requireRecords(data.slotAssessments, 'kết quả hoạt động của trẻ');
  const resultKeys = data.slotAssessments.map(
    (record) => `${record.isoDate}:${record.routineSlot}`
  );
  if (
    data.slotAssessments.some((record) => !calendarDate(record.isoDate) || !record.routineSlot) ||
    new Set(resultKeys).size !== resultKeys.length
  ) {
    throw new Error(
      'Kết quả hoạt động thiếu hoặc trùng khóa ngày/khung. Chưa thể ghép nhận xét chính xác.'
    );
  }
  return data;
}
