import { apiClient } from '@/shared/api/client';

export async function getNotifications(signal) {
  const { data: response } = await apiClient.get('/parent/notifications', { signal });
  const data = response?.data;
  if (
    response?.success !== true ||
    !Number.isInteger(data?.unreadCount) ||
    data.unreadCount < 0 ||
    !Array.isArray(data.notifications) ||
    data.notifications.some((item) => !item?.id || typeof item.isRead !== 'boolean') ||
    new Set(data.notifications.map((item) => String(item.id))).size !== data.notifications.length
  ) {
    throw new Error('Máy chủ chưa trả danh sách thông báo hợp lệ.');
  }
  return data;
}

export async function markNotificationRead(id) {
  const { data } = await apiClient.patch(`/parent/notifications/${encodeURIComponent(id)}/read`);
  if (data?.success !== true) throw new Error('Máy chủ chưa xác nhận đã đánh dấu thông báo.');
}
