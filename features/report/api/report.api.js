import { apiClient } from '@/shared/api/client';

function readData(response) {
  const body = response.data;
  if (body?.success !== true || !body.data || typeof body.data !== 'object') {
    throw new Error('Hệ thống chưa trả đủ dữ liệu báo cáo.');
  }
  return body.data;
}

export async function getClassStudents(classId, signal) {
  const data = readData(
    await apiClient.get(`/classes/${encodeURIComponent(classId)}/students`, { signal })
  );
  if (!data.class || !Array.isArray(data.students) || data.students.some((s) => !s?.id)) {
    throw new Error('Danh sách học sinh chưa đúng định dạng.');
  }
  return data;
}

// Học sinh đã chuyển khỏi lớp (đơn chuyển lớp chiều OUT đã duyệt). Danh sách lớp hiện tại không còn
// các bé này nên Tổng quan lớp hiện riêng ở mục thu gọn; báo cáo vẫn mở được theo studentId.
export async function getTransferredStudents(classId, signal) {
  const data = readData(
    await apiClient.get(`/classes/${encodeURIComponent(classId)}/transfers`, {
      params: { direction: 'OUT', status: 'APPROVED' },
      signal,
    })
  );
  if (!Array.isArray(data.items) || data.items.some((item) => !item?.studentId)) {
    throw new Error('Danh sách chuyển lớp chưa đúng định dạng.');
  }
  return data.items.map((item) => ({
    id: String(item.studentId),
    fullName: item.studentName || '',
    studentCode: item.studentCode || '',
    avatarUrl: item.studentAvatar || '',
    toClassName: item.toClassName || '',
    transferDate: item.transferDate || '',
  }));
}

function readReport(data, expectedStudentId) {
  if (data.student === null) return data;
  if (!data.student?.id || !data.classInfo || !data.semesterInfo) {
    throw new Error('Báo cáo chưa có đủ thông tin học sinh và học kỳ.');
  }
  if (
    expectedStudentId &&
    ![data.student.id, data.student.publicId].some((id) => String(id) === String(expectedStudentId))
  ) {
    throw new Error('Báo cáo trả về không khớp học sinh đã chọn.');
  }
  for (const section of ['health', 'attendance', 'assessments', 'authorizations']) {
    if (
      !Array.isArray(data[section]?.history) ||
      data[section].history.some((record) => !record || typeof record !== 'object')
    )
      throw new Error('Hệ thống trả thiếu một phần báo cáo.');
  }
  return data;
}

export async function getStudentReport({ classId, studentId, semester, signal }) {
  const data = readData(
    await apiClient.get(`/classes/${encodeURIComponent(classId)}/student-report`, {
      params: { studentId, semester },
      signal,
    })
  );
  return readReport(data, studentId);
}

export async function getParentReport({ studentId, semester, signal }) {
  const data = readData(
    await apiClient.get('/parent/student-report', { params: { semester }, signal })
  );
  return readReport(data, studentId);
}

// Giáo viên của lớp bé đang học để phụ huynh liên hệ. Một lớp có thể có nhiều giáo viên phụ trách
// (backend cho tối đa 3, BR-38): đọc `teachers` của /parent/home như web; bản cũ chỉ có
// `primaryTeacher`. Mảng rỗng khi lớp chưa có giáo viên.
export async function getClassTeachers(signal) {
  const data = readData(await apiClient.get('/parent/home', { signal }));
  const list = Array.isArray(data.teachers)
    ? data.teachers
    : data.primaryTeacher
      ? [data.primaryTeacher]
      : [];
  return list
    .filter((teacher) => teacher && typeof teacher === 'object' && teacher.fullName)
    .map((teacher, index) => ({
      id: String(teacher.id || teacher.employeeCode || index),
      fullName: teacher.fullName,
      phone: teacher.phone || '',
      email: teacher.email || '',
      avatarUrl: teacher.avatarUrl || '',
    }));
}

// Chuyên cần cả lớp theo tháng, học kỳ hoặc cả năm (cùng endpoint web dùng cho "Chuyên cần lớp").
export async function getClassAttendanceStats({ classId, period, signal }) {
  const params =
    period.type === 'month'
      ? { period: 'month', month: period.month, year: period.year }
      : period.type === 'semester'
        ? { period: 'semester', semester: period.semester }
        : { period: 'year' };
  const data = readData(
    await apiClient.get(`/attendance/classes/${encodeURIComponent(classId)}/stats`, {
      params,
      signal,
    })
  );
  if (
    !data.stats ||
    typeof data.stats !== 'object' ||
    !Array.isArray(data.studentsSummary) ||
    !Array.isArray(data.dailyTrend) ||
    data.studentsSummary.some((student) => !student?.id)
  ) {
    throw new Error('Thống kê chuyên cần chưa đúng định dạng.');
  }
  return data;
}
