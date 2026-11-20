import { apiClient } from '@/shared/api/client';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';

// GV dùng hộp thư chung `/notifications/*`; PH dùng nhóm route riêng `/parent/notifications`.
// Backend không chặn GV gọi route PH, nên chọn sai đường dẫn vẫn trả 200.
const INBOX_PAGE_SIZE = 50;
const INBOX_MAX_PAGES = 4;
const INVALID_LIST = 'Hệ thống chưa trả danh sách thông báo hợp lệ.';

function pad(value) {
  return String(value).padStart(2, '0');
}

// Đưa thời điểm ISO của `/notifications/my` về cùng dạng chuỗi PH nhận từ backend.
function formatCreatedAt(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return '';
  return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(date.getDate())}/${pad(
    date.getMonth() + 1
  )}/${date.getFullYear()}`;
}

function assertInbox(unreadCount, notifications) {
  if (
    !Number.isInteger(unreadCount) ||
    unreadCount < 0 ||
    !Array.isArray(notifications) ||
    notifications.some((item) => !item?.id || typeof item.isRead !== 'boolean') ||
    new Set(notifications.map((item) => String(item.id))).size !== notifications.length
  ) {
    throw new Error(INVALID_LIST);
  }
}

// Bản tin trường (data.batch_id) thường cũ hơn thông báo hoạt động lớp, nên chỉ lấy trang đầu sẽ
// bỏ sót bản tin. Lấy lần lượt các trang (đã kiểm chứng `pagination.totalPages` trên test2), có giới
// hạn số trang để một hộp thư rất lớn không tải mãi.
async function getTeacherNotifications(signal) {
  const items = [];
  let unreadCount;
  for (let page = 1; page <= INBOX_MAX_PAGES; page += 1) {
    const { data: response } = await apiClient.get('/notifications/my', {
      params: { page, limit: INBOX_PAGE_SIZE },
      signal,
    });
    const data = response?.data;
    if (response?.success !== true) throw new Error(INVALID_LIST);
    assertInbox(data?.unreadCount, data?.items);
    if (page === 1) unreadCount = data.unreadCount;
    items.push(...data.items);
    const totalPages = data.pagination?.totalPages;
    if (!Number.isInteger(totalPages) || page >= totalPages || !data.items.length) break;
  }
  // Trang sau có thể lặp mục nếu có thông báo mới chen vào giữa hai lần gọi.
  const unique = [...new Map(items.map((item) => [String(item.id), item])).values()];
  return {
    unreadCount,
    notifications: unique.map((item) => ({
      ...item,
      createdAt: formatCreatedAt(item.createdAt),
    })),
  };
}

async function getParentNotifications(signal) {
  const { data: response } = await apiClient.get('/parent/notifications', { signal });
  const data = response?.data;
  if (response?.success !== true) throw new Error(INVALID_LIST);
  assertInbox(data?.unreadCount, data?.notifications);
  return data;
}

export function getNotifications(role, signal) {
  if (role === AUTH_ROLES.teacher) return getTeacherNotifications(signal);
  if (role === AUTH_ROLES.parent) return getParentNotifications(signal);
  return Promise.reject(new Error('Tài khoản này không có hộp thông báo trên mobile.'));
}

export async function markNotificationRead(role, id) {
  let path;
  if (role === AUTH_ROLES.teacher) {
    path =
      id === 'all' ? '/notifications/read-all' : `/notifications/${encodeURIComponent(id)}/read`;
  } else if (role === AUTH_ROLES.parent) {
    path = `/parent/notifications/${encodeURIComponent(id)}/read`;
  } else {
    throw new Error('Tài khoản này không có hộp thông báo trên mobile.');
  }
  const { data } = await apiClient.patch(path);
  if (data?.success !== true) throw new Error('Hệ thống chưa xác nhận đã đánh dấu thông báo.');
}
