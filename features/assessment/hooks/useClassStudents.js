import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

// Endpoint đánh giá theo tuần không trả avatarUrl, nên lấy ảnh thật từ danh sách học sinh của lớp.
export async function fetchClassStudents(classId) {
  const response = await apiClient.get(`/classes/${classId}/students`);
  return response.data.data;
}

export function useClassStudents(classId) {
  return useQuery({
    queryKey: ['assessment', 'class-students', classId],
    queryFn: () => fetchClassStudents(classId),
    enabled: Boolean(classId),
    staleTime: 5 * 60 * 1000,
  });
}
