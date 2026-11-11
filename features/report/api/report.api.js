import { apiClient } from '@/shared/api/client';

function readData(response) {
  const body = response.data;
  if (body?.success !== true || !body.data || typeof body.data !== 'object') {
    throw new Error('Máy chủ chưa trả đủ dữ liệu báo cáo.');
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
      throw new Error('Máy chủ trả thiếu một phần báo cáo.');
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
