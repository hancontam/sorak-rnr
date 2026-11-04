import { apiClient } from '@/shared/api/client';

export async function getNotifications() {
  const response = await apiClient.get('/parent/notifications');
  return response.data?.data || { unreadCount: 0, notifications: [] };
}

export async function markNotificationRead(id) {
  const response = await apiClient.patch(`/parent/notifications/${encodeURIComponent(id)}/read`);
  return response.data?.data;
}
