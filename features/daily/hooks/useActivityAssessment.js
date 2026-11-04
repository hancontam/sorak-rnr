import { useClassStudents } from '@/features/assessment/hooks/useClassStudents';
import {
  getActivityAssessment,
  getTimetable,
  saveActivityAssessment,
} from '@/features/daily/api/daily.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

export function useActivityAssessment({ classId, slotId, date }) {
  const client = useQueryClient();
  const [draft, setDraft] = useState({});
  const valid = Boolean(classId && slotId && /^\d{4}-\d{2}-\d{2}$/.test(date));
  const timetable = useQuery({
    queryKey: ['daily-timetable-teacher', classId, date],
    queryFn: () => getTimetable(classId, { date }),
    enabled: valid,
  });
  const roster = useClassStudents(classId);
  const slots = useMemo(
    () =>
      (timetable.data?.slots || [])
        .filter((item) => item.fullDate === date)
        .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime))),
    [timetable.data, date]
  );
  const slot = slots.find((item) => String(item.id) === slotId);
  const params = { slotId, activityId: slot?.activityId, date };
  const recordsKey = ['activity-assessment', classId, slotId, slot?.activityId, date];
  const assessment = useQuery({
    queryKey: recordsKey,
    queryFn: () => getActivityAssessment(classId, params),
    enabled: valid && Boolean(slot?.activityId),
    refetchOnWindowFocus: false,
  });
  const students = (roster.data?.students || []).map((student) => {
    const id = String(student.publicId || student.id);
    const record = assessment.data?.records.find((item) => String(item.studentId) === id);
    // Like the web flow, unsaved rows start with a proposed "Đạt". They are not saved until confirmation.
    const initial = { status: record?.status || 'ACHIEVED', note: record?.note || '' };
    const value = { ...initial, ...draft[id] };
    return {
      id,
      name: student.fullName,
      code: student.studentCode,
      avatarUrl: student.avatarUrl,
      ...value,
      saved: Boolean(record),
      changed: !record || value.status !== initial.status || value.note !== initial.note,
    };
  });
  const changed = students.filter((student) => student.changed);
  const hasEdits =
    Object.keys(draft).length > 0 &&
    students.some((student) => draft[student.id] && student.changed);
  const save = useMutation({
    mutationFn: () =>
      saveActivityAssessment(classId, {
        ...params,
        records: changed.map(({ id, status, note }) => ({ studentId: id, status, note })),
      }),
    onSuccess: async () => {
      client.setQueryData(recordsKey, {
        records: students.map(({ id, status, note }) => ({ studentId: id, status, note })),
      });
      setDraft({});
      await Promise.all([
        client.invalidateQueries({ queryKey: recordsKey }),
        client.invalidateQueries({ queryKey: ['daily-timetable-teacher', classId] }),
        client.invalidateQueries({ queryKey: ['assessment'] }),
      ]);
    },
  });
  const error = !valid
    ? new Error('Thiếu lớp, ngày hoặc hoạt động hợp lệ để đánh giá.')
    : timetable.error || roster.error || assessment.error;
  return {
    slot,
    slots,
    students,
    hasEdits,
    changedCount: changed.length,
    save,
    isLoading:
      valid && (timetable.isPending || roster.isPending || (Boolean(slot) && assessment.isPending)),
    error,
    ready: Boolean(slot && assessment.isSuccess && roster.isSuccess),
    update: (id, patch) =>
      setDraft((current) => ({ ...current, [id]: { ...current[id], ...patch } })),
    retry: () =>
      Promise.all([timetable.refetch(), roster.refetch(), ...(slot ? [assessment.refetch()] : [])]),
  };
}
