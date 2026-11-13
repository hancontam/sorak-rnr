import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { assignedClass } from '@/features/auth/utils/class-assignment';

import { schoolToday, calendarDate } from '@/features/daily/utils/schedule-date';

import {
  getAuthorizationStudents,
  getPickupRequests,
  submitPickupRequest,
} from '../api/pickup-requests.api';

const DONE_MESSAGES = {
  cancel: 'Đã hủy đơn ủy quyền.',
  approve: 'Đã duyệt đơn ủy quyền.',
  reject: 'Đã từ chối đơn ủy quyền.',
};

const EXPECTED_STATUS = {
  create: 'PENDING',
  cancel: 'CANCELLED',
  approve: 'APPROVED',
  reject: 'REJECTED',
};

export function usePickupRequests({ enabled = true, date = schoolToday(), creating = false } = {}) {
  const user = useAuthStore((state) => state.user);
  const isParent = user?.role === AUTH_ROLES.parent;
  const isTeacher = user?.role === AUTH_ROLES.teacher;
  const assignment = isTeacher ? assignedClass(user) : {};
  const studentId = user?.student?.id;
  const classId = assignment.classId;
  const client = useQueryClient();
  const [message, setMessage] = useState(null);
  const [needsReload, setNeedsReload] = useState(false);
  const [saving, setSaving] = useState(false);
  const running = useRef(false);
  const pendingReceipt = useRef(null);
  const uncertainCreate = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const isCurrent = () => mounted.current && useAuthStore.getState().user === user;
  const allowed =
    Boolean(calendarDate(date)) && (isParent ? Boolean(studentId) : isTeacher && Boolean(classId));
  const key = ['pickup-requests', user?.id, user?.role, isParent ? studentId : classId, date];

  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => getPickupRequests({ isParent, studentId, classId, date, signal }),
    enabled: allowed && enabled,
  });
  const studentsQuery = useQuery({
    queryKey: ['pickup-students', user?.id, classId, date],
    queryFn: ({ signal }) => getAuthorizationStudents({ classId, date, signal }),
    enabled: Boolean(allowed && isTeacher && enabled && creating),
  });
  const mutation = useMutation({
    mutationFn: (input) => submitPickupRequest({ isParent, classId, ...input }),
  });

  async function reload() {
    if (!allowed || running.current) return;
    const result = await query.refetch();
    if (!isCurrent()) return;
    if (!result.isError) {
      if (pendingReceipt.current) {
        const receipt = pendingReceipt.current;
        if (!matchesReceipt(result.data.requests, receipt)) {
          setMessage({
            error: true,
            text: 'Chưa thấy đúng trạng thái đơn vừa gửi. Giữ nguyên form để kiểm tra, không gửi lại đơn mới.',
          });
          return false;
        }
        pendingReceipt.current = null;
        uncertainCreate.current = false;
        setNeedsReload(false);
        setMessage({ text: 'Đã đọc lại và xác nhận trạng thái đơn.' });
        return true;
      }
      if (uncertainCreate.current) {
        setMessage({
          error: true,
          text: 'Không nhận được mã đơn từ lần gửi trước. Đóng form và kiểm tra danh sách trước khi quyết định tạo lại.',
        });
        return false;
      }
      setNeedsReload(false);
      setMessage(null);
    }
  }

  async function act(action, requestId, body) {
    if (!allowed || !query.isSuccess || running.current || needsReload) return false;
    if (!(isParent ? ['create', 'cancel'] : ['create', 'approve', 'reject']).includes(action))
      return false;
    if (
      action === 'create' &&
      !isParent &&
      (!studentsQuery.isSuccess ||
        !studentsQuery.data.some((student) => String(student.id) === String(body?.studentId)))
    ) {
      setMessage({ error: true, text: 'Chọn học sinh trong danh sách của lớp đang phụ trách.' });
      return false;
    }
    const id = requestId == null ? '' : String(requestId);
    if (
      action !== 'create' &&
      !query.data.requests.some((item) => String(item.id) === id && item.status === 'PENDING')
    ) {
      setMessage({ error: true, text: 'Đơn không còn ở trạng thái chờ duyệt. Hãy tải lại.' });
      setNeedsReload(true);
      return false;
    }
    running.current = true;
    setSaving(true);
    setMessage(null);
    try {
      if (action === 'create') uncertainCreate.current = true;
      const savedId = await mutation.mutateAsync({ action, id, body });
      if (!isCurrent()) return false;
      const expected = action === 'create' && !isParent ? 'APPROVED' : EXPECTED_STATUS[action];
      const receipt = {
        id: savedId,
        status: expected,
        studentId: action === 'create' && !isParent ? String(body.studentId) : null,
        studentCode:
          action === 'create' && !isParent
            ? studentsQuery.data.find((student) => String(student.id) === String(body.studentId))
                ?.code
            : null,
      };
      pendingReceipt.current = receipt;
      uncertainCreate.current = false;
      const result = await query.refetch();
      await Promise.all([
        client.invalidateQueries({ queryKey: ['pickup-requests', user.id] }),
        client.invalidateQueries({ queryKey: ['report', user.id] }),
        client.invalidateQueries({ queryKey: ['daily-records', user.id] }),
        client.invalidateQueries({ queryKey: ['pickup-students', user.id] }),
        client.invalidateQueries({ queryKey: ['timetable', user.id] }),
      ]);
      if (!isCurrent()) return false;
      const confirmed = !result.isError && matchesReceipt(result.data.requests, receipt);
      if (confirmed) pendingReceipt.current = null;
      setNeedsReload(!confirmed);
      setMessage(
        confirmed
          ? {
              text:
                action === 'create'
                  ? isParent
                    ? 'Đã gửi đơn ủy quyền, đang chờ cô duyệt.'
                    : 'Đã tạo đơn ủy quyền đã duyệt.'
                  : DONE_MESSAGES[action],
            }
          : {
              error: true,
              text: 'Máy chủ đã nhận yêu cầu nhưng chưa đối chiếu được trạng thái. Hãy tải lại danh sách.',
            }
      );
      return confirmed;
    } catch (error) {
      if (!isCurrent()) return false;
      if (error.response?.status >= 400 && error.response?.status < 500)
        uncertainCreate.current = false;
      const detail = error.response?.data?.message;
      setMessage({
        error: true,
        text:
          typeof detail === 'string'
            ? detail
            : 'Chưa xác nhận được thao tác. Hãy tải lại danh sách trước khi gửi lại.',
      });
      setNeedsReload(true);
      return false;
    } finally {
      running.current = false;
      setSaving(false);
    }
  }

  return {
    query,
    studentsQuery,
    allowed,
    isParent,
    assignmentError: assignment.error,
    saving,
    needsReload,
    message,
    act,
    reload,
  };
}

function matchesReceipt(requests, receipt) {
  return requests.some(
    (item) =>
      String(item.id) === receipt.id &&
      item.status === receipt.status &&
      (!receipt.studentId ||
        String(item.student?.id) === receipt.studentId ||
        // Live test2 authorization list returns internal student ID; dismissal uses UUID.
        (receipt.studentCode && item.student?.code === receipt.studentCode))
  );
}
