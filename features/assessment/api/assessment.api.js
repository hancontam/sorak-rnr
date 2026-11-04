import { apiClient } from '@/shared/api/client';

export async function fetchAssessmentClassStudents(classId) {
  const response = await apiClient.get(`/classes/${encodeURIComponent(classId)}/students`);
  return response.data.data;
}

// Giáo viên: đánh giá học kỳ của lớp được phân công.
export async function fetchSemesterAssessment({ classId, semester = 'SEMESTER_1' }) {
  const response = await apiClient.get(`/assessment/classes/${classId}/semester`, {
    params: { semester },
  });
  return response.data.data;
}

// Giáo viên: lưu lời bình cuối học kỳ. Body theo service: { semester, records: [{ studentId, teacherNotes }] }.
export async function saveSemesterAssessment({ classId, semester = 'SEMESTER_1', records }) {
  const response = await apiClient.post(`/assessment/classes/${classId}/semester`, {
    semester,
    records,
  });
  return response.data.data;
}

// Giáo viên: sổ bé ngoan theo tháng.
export async function fetchMonthlyAssessment({ classId, month, year }) {
  const response = await apiClient.get(`/assessment/classes/${classId}/monthly`, {
    params: { ...(month ? { month } : {}), ...(year ? { year } : {}) },
  });
  return response.data.data;
}

// Giáo viên: lưu sổ bé ngoan. Body theo service: { month, year, records: [{ studentId, week1Rose..week5Rose, teacherNotes }] }.
export async function saveMonthlyAssessment({ classId, month, year, records }) {
  const response = await apiClient.post(`/assessment/classes/${classId}/monthly`, {
    month,
    year,
    records,
  });
  return response.data.data;
}

// Phụ huynh: một endpoint trả cả sổ liên lạc theo tháng và đánh giá học kỳ của con.
export async function fetchParentResults() {
  const response = await apiClient.get('/parent/good-behavior');
  return response.data.data;
}

export async function submitParentFeedback({ month, year, feedback }) {
  const response = await apiClient.post('/parent/good-behavior/feedback', {
    month,
    year,
    feedback,
  });
  return response.data.data;
}
