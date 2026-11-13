import { useMutation, useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { isMobileRole } from '@/features/auth/utils/auth-roles';

import { getNotifications, markNotificationRead } from '../api/notification.api';

export function useNotificationInbox() {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ['notification-inbox', user?.id],
    queryFn: ({ signal }) => getNotifications(signal),
    enabled: Boolean(user?.id && isMobileRole(user.role)),
  });
}

export function useNotificationReadActions(query) {
  const user = useAuthStore((state) => state.user);
  const writing = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const mutation = useMutation({ mutationFn: markNotificationRead });

  async function markRead(id) {
    if (writing.current || !user?.id || useAuthStore.getState().user !== user || !query.isSuccess)
      return false;
    if (
      id === 'all'
        ? query.data.unreadCount === 0
        : !query.data.notifications.some((item) => item.id === id && !item.isRead)
    )
      return false;

    writing.current = true;
    const targeted = new Set(
      query.data.notifications
        .filter((item) => !item.isRead && (id === 'all' || item.id === id))
        .map((item) => item.id)
    );
    setBusy(true);
    setError('');
    try {
      await mutation.mutateAsync(id);
      if (useAuthStore.getState().user !== user) return false;
      const result = await query.refetch();
      if (useAuthStore.getState().user !== user) return false;
      if (result.isError) {
        setError('Chưa tải lại được trạng thái thông báo. Hãy làm mới danh sách.');
      } else if (result.data.notifications.some((item) => targeted.has(item.id) && !item.isRead)) {
        setError('Một số thông báo vừa chọn vẫn chưa được đánh dấu đã đọc. Hãy thử lại.');
      } else return true;
      return false;
    } catch {
      if (useAuthStore.getState().user === user)
        setError('Chưa xác nhận được thay đổi. Hãy tải lại danh sách trước khi thử lại.');
      return false;
    } finally {
      writing.current = false;
      setBusy(false);
    }
  }

  async function reload() {
    if (writing.current) return;
    setError('');
    await query.refetch();
  }

  return { markRead, busy, error, reload };
}
