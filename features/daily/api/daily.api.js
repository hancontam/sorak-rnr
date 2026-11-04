import { apiClient } from '@/shared/api/client';

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
