import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { assignedClass } from '@/features/auth/utils/class-assignment';

import { getChildResults, getClassResults, saveChildFeedback } from '../api/assessment.api';

export function useLearningResults({ kind, period, semester }) {
  const user = useAuthStore((state) => state.user);
  const client = useQueryClient();
  const parent = user?.role === AUTH_ROLES.parent;
  const teacher = user?.role === AUTH_ROLES.teacher;
  const studentId = user?.student?.id;
  const assignment = teacher ? assignedClass(user) : {};
  const valid = kind === 'monthly' || kind === 'semester';
  const childPeriod = kind === 'monthly' ? period : undefined;
  const childKey = (selected) => [
    'learning-results',
    user?.id,
    'child',
    studentId,
    selected?.year,
    selected?.month,
  ];
  const query = useQuery({
    queryKey: parent
      ? childKey(childPeriod)
      : [
          'learning-results',
          user?.id,
          'class',
          assignment.classId,
          kind,
          ...(kind === 'monthly' ? [period?.year, period?.month] : [semester]),
        ],
    enabled: valid && Boolean(parent ? studentId : teacher && assignment.classId),
    queryFn: ({ signal }) =>
      parent
        ? getChildResults({ studentId, period: childPeriod, signal })
        : getClassResults({ classId: assignment.classId, kind, period, semester, signal }),
  });
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const writing = useRef(false);
  const mutation = useMutation({ mutationFn: saveChildFeedback });

  async function sendFeedback(value, originalFeedback) {
    const text = value.trim();
    const data = query.data;
    if (
      !parent ||
      kind !== 'monthly' ||
      !query.isSuccess ||
      !data?.record?.id ||
      !text ||
      text === originalFeedback ||
      writing.current ||
      useAuthStore.getState().user !== user
    )
      return false;
    const { month, year } = data.period;
    const selected = { month, year };
    writing.current = true;
    setSaving(true);
    setMessage(null);
    try {
      const latest = await getChildResults({ studentId, period: selected });
      if (useAuthStore.getState().user !== user) return false;
      if (
        latest.record?.id !== data.record.id ||
        (latest.record.parentFeedback || '') !== originalFeedback
      ) {
        await query.refetch();
        setMessage({
          error: true,
          text: 'Phiếu tháng đã thay đổi. Hãy mở lại form để xem phản hồi mới nhất.',
        });
        return false;
      }
      await mutation.mutateAsync({ ...selected, feedback: text });
      if (useAuthStore.getState().user !== user) return false;
      const result = await getChildResults({ studentId, period: selected });
      if (useAuthStore.getState().user !== user) return false;
      if (result.record?.id !== data.record.id || result.record.parentFeedback !== text) {
        throw new Error('Chưa đối chiếu được phản hồi vừa gửi. Hãy tải lại phiếu tháng.');
      }
      client.setQueryData(childKey(selected), result);
      if (!childPeriod) client.setQueryData(childKey(), result);
      else await client.invalidateQueries({ queryKey: childKey(), exact: true });
      setMessage({ text: 'Đã lưu phản hồi cho tháng đang xem.' });
      return true;
    } catch (error) {
      if (useAuthStore.getState().user !== user) return false;
      setMessage({
        error: true,
        text:
          error.response?.status >= 500
            ? 'Máy chủ chưa xác nhận lưu phản hồi. Hãy tải lại phiếu tháng.'
            : error.response?.data?.message || error.message,
      });
      return false;
    } finally {
      writing.current = false;
      setSaving(false);
    }
  }

  return {
    parent,
    query,
    saving,
    message,
    sendFeedback,
    clearMessage: () => setMessage(null),
    error: !valid
      ? 'Mục kết quả không hợp lệ.'
      : parent
        ? studentId
          ? ''
          : 'Tài khoản chưa liên kết với hồ sơ trẻ.'
        : assignment.error || (assignment.classId ? '' : 'Bạn chưa được phân công lớp.'),
  };
}
