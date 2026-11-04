import { apiClient } from '@/shared/api/client';

export async function getActivityAssessment(classId, params) {
  const response = await apiClient.get(
    `/assessment/classes/${encodeURIComponent(classId)}/records`,
    { params }
  );
  if (!Array.isArray(response.data?.data?.records))
    throw new Error('Dữ liệu đánh giá không hợp lệ.');
  return response.data.data;
}

export async function saveActivityAssessment(classId, payload) {
  const response = await apiClient.post(
    `/assessment/classes/${encodeURIComponent(classId)}/records`,
    payload
  );
  const result = response.data?.data;
  if (result?.savedCount !== payload.records.length) {
    throw new Error('Chưa lưu đủ đánh giá. Vui lòng tải lại để kiểm tra trước khi thử lại.');
  }
  return result;
}

export async function getTimetable(classId, params = {}) {
  const targetId = classId || 'default';
  const response = await apiClient.get(`/attendance/classes/${targetId}/timetable`, { params });
  return response.data?.data;
}

export async function getParentSchedule(params = {}) {
  const response = await apiClient.get('/parent/schedule', { params });
  return response.data?.data;
}

export async function saveAttendanceRecords(classId, payload) {
  const targetId = classId || 'default';
  const response = await apiClient.post(`/attendance/classes/${targetId}/records`, payload);
  return response.data?.data;
}

export async function getDismissalOverview(classId, params = {}) {
  const targetId = classId || 'default';
  const response = await apiClient.get(`/attendance/classes/${targetId}/dismissal`, { params });
  return response.data?.data;
}

export async function saveDismissalRecords(classId, payload) {
  const targetId = classId || 'default';
  const response = await apiClient.post(`/attendance/classes/${targetId}/dismissal`, payload);
  return response.data?.data;
}

export async function getHealthOverview(classId, params = {}) {
  const targetId = classId || 'default';
  const response = await apiClient.get(`/student-health/classes/${targetId}`, { params });
  return response.data?.data;
}

export async function saveHealthRecords(classId, payload) {
  const targetId = classId || 'default';
  const response = await apiClient.post(`/student-health/classes/${targetId}/records`, payload);
  return response.data?.data;
}
