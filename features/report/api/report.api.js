import { apiClient } from '@/shared/api/client';

export async function getClassStudents(classId) {
  const response = await apiClient.get(`/classes/${encodeURIComponent(classId)}/students`);
  return response.data.data;
}

export async function getStudentDetail(studentId) {
  const response = await apiClient.get(`/students/${encodeURIComponent(studentId)}`);
  return response.data.data;
}

export async function getStudentReport(classId, studentId) {
  const response = await apiClient.get(`/classes/${encodeURIComponent(classId)}/student-report`, {
    params: { studentId },
  });
  return response.data.data;
}
