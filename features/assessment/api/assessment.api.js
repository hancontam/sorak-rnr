import { apiClient } from '@/shared/api/client';

function readData(response) {
  const body = response.data;
  if (body?.success !== true || !body.data || typeof body.data !== 'object') {
    throw new Error('Máy chủ chưa trả dữ liệu kết quả học tập hợp lệ.');
  }
  return body.data;
}

function validPeriod(period) {
  return (
    Number.isInteger(period?.month) &&
    period.month >= 1 &&
    period.month <= 12 &&
    Number.isInteger(period.year)
  );
}

export async function getClassResults({ classId, kind, period, semester, signal }) {
  const data = readData(
    await apiClient.get(`/assessment/classes/${encodeURIComponent(classId)}/${kind}`, {
      params: kind === 'monthly' ? period : { semester },
      signal,
    })
  );
  const { classInfo, students } = data;
  if (
    String(classInfo?.id) !== String(classId) ||
    !Array.isArray(students) ||
    students.some((student) => !student?.id) ||
    new Set(students.map((student) => String(student.id))).size !== students.length
  ) {
    throw new Error('Danh sách kết quả không khớp lớp được phân công.');
  }
  if (
    kind === 'semester'
      ? classInfo.semester !== semester
      : !validPeriod(classInfo) ||
        (period && (classInfo.month !== period.month || classInfo.year !== period.year))
  ) {
    throw new Error('Máy chủ trả kết quả cho kỳ khác.');
  }
  return data;
}

export async function getChildResults({ studentId, period, signal }) {
  const data = readData(await apiClient.get('/parent/good-behavior', { params: period, signal }));
  if (
    ![data.student?.id, data.student?.publicId].some((id) => id && String(id) === String(studentId))
  ) {
    throw new Error('Kết quả không khớp hồ sơ của con.');
  }
  if (
    !validPeriod(data.period) ||
    (period && (data.period.month !== period.month || data.period.year !== period.year)) ||
    !Array.isArray(data.semesterAssessments)
  ) {
    throw new Error('Máy chủ trả thiếu kết quả hoặc trả sai tháng đã chọn.');
  }
  return {
    student: data.student,
    classInfo: data.classInfo,
    period: data.period,
    monthWeeks: data.monthWeeks,
    weekRanges: data.weekRanges,
    weeklyStats: data.weeklyStats,
    record: data.record,
    semesterAssessments: data.semesterAssessments.filter(
      (item) => item?.isPublished === true && item.isDraft === false
    ),
  };
}

export async function saveChildFeedback({ month, year, feedback }) {
  readData(await apiClient.post('/parent/good-behavior/feedback', { month, year, feedback }));
}
