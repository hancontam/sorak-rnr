import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { useTranslation } from '@/shared/i18n/useLanguage';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { assignedClass } from '@/features/auth/utils/class-assignment';
import { useClassStudents } from '@/features/report/hooks/useClassStudents';

import { cancelDismissal, getDailyRecords, saveDailyRecords } from '../api/daily-records.api';
import {
  DAILY_ACTIONS,
  draftRecord,
  initialRecord,
  isAbsent,
  recordMatches,
  toDailyRecord,
} from '../utils/daily-records';
import { calendarDate, schoolToday } from '../utils/schedule-date';
import { dayActivities } from '../utils/timetable-model';
import { useTimetable } from './useTimetable';

const SAVED_MESSAGES = {
  attendance: 'Đã lưu điểm danh cho {count} học sinh.',
  health: 'Đã lưu số đo sức khỏe cho {count} học sinh.',
  assessment: 'Đã lưu đánh giá cho {count} học sinh.',
};

const DISMISSAL_FIELDS = [
  'checkOutTime',
  'pickupPersonName',
  'pickupRelationship',
  'pickupPersonPhone',
  'pickupCitizenId',
  'pickupPhotoUrl',
  'pickupNote',
];

export function useDailyRecords({ kind, date, slotId }) {
  const t = useTranslation();
  const user = useAuthStore((state) => state.user);
  const client = useQueryClient();
  const assignment = assignedClass(user);
  const timetable = useTimetable(date);
  // Lịch và đánh giá không trả avatar: ghép theo id từ danh sách lớp (đã kiểm chứng id khớp trên test2).
  const roster = useClassStudents();
  const avatars = new Map(
    (roster.query.data?.students || []).map((student) => [String(student.id), student.avatarUrl])
  );
  const [drafts, setDrafts] = useState({});
  const [baseline, setBaseline] = useState(null);
  const [message, setMessage] = useState(null);
  const [needsReload, setNeedsReload] = useState(false);
  const running = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const isCurrent = () => mounted.current && useAuthStore.getState().user === user;
  const valid =
    user?.role === AUTH_ROLES.teacher &&
    assignment.classId &&
    Object.hasOwn(DAILY_ACTIONS, kind) &&
    calendarDate(date);
  const isAssessment = kind === 'assessment';
  const slot =
    valid && isAssessment && timetable.query.data
      ? dayActivities(timetable.query.data, date, false).find((item) => item.id === slotId)
      : null;
  const canEdit = Boolean(valid && date <= schoolToday());
  const params = { kind, classId: assignment.classId, date, slot };
  const key = [
    'daily-records',
    user?.id,
    assignment.classId,
    kind,
    date,
    slot?.id,
    slot?.activityId,
  ];
  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => getDailyRecords({ ...params, signal }),
    enabled: Boolean(valid && (!isAssessment || slot?.activityId)),
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (query.data && baseline === null) setBaseline(query.data);
  }, [query.data, baseline]);
  const initialById = new Map((baseline || []).map((student) => [String(student.id), student]));
  const rows = (query.data || []).map((student) => {
    const id = String(student.id);
    const initial = initialRecord(kind, initialById.get(id) || student);
    const defaultDraft = draftRecord(kind, initial);
    const value = drafts[id] || defaultDraft;
    const fields = Object.keys(initial);
    const changed = fields.some((field) => initial[field] !== value[field]);
    const edited = fields.some((field) => defaultDraft[field] !== value[field]);
    const avatarUrl = student.avatarUrl || avatars.get(id) || '';
    return { id, student, value, changed, edited, avatarUrl };
  });

  const mutation = useMutation({
    mutationFn: (records) => saveDailyRecords({ ...params, records }),
  });
  const cancelMutation = useMutation({
    mutationFn: (studentId) => cancelDismissal({ classId: assignment.classId, studentId, date }),
  });

  function refreshRelatedRecords() {
    return Promise.all([
      client.invalidateQueries({ queryKey: ['timetable', user.id] }),
      client.invalidateQueries({ queryKey: ['report', user.id] }),
    ]);
  }

  function acceptSavedRows(students, savedIds) {
    const saved = new Map(
      students
        .filter((student) => savedIds.has(String(student.id)))
        .map((student) => [String(student.id), student])
    );
    // Keep the original baseline for other students so their drafts still detect conflicts.
    setBaseline((current) => current.map((student) => saved.get(String(student.id)) ?? student));
    setDrafts((current) => {
      const next = { ...current };
      for (const id of saved.keys()) delete next[id];
      return next;
    });
  }

  async function reload() {
    if (!valid || running.current) return;
    if (isAssessment && !slot?.activityId) {
      await timetable.query.refetch();
      return;
    }
    const result = await query.refetch();
    if (!isCurrent()) return;
    if (!result.isError) {
      setBaseline(result.data);
      setDrafts({});
      setNeedsReload(false);
      setMessage(null);
    }
  }

  function update(id, patch) {
    if (running.current || needsReload) return;
    const row = rows.find((item) => item.id === id);
    if (!row) return;
    setMessage(null);
    setDrafts((current) => ({ ...current, [id]: { ...row.value, ...current[id], ...patch } }));
  }

  const [isSaving, setIsSaving] = useState(false);
  async function save(onlyId) {
    if (!canEdit || running.current || needsReload || !query.isSuccess || !baseline) return;
    // Validate the whole relevant roster, never the filtered list visible on screen.
    // Test2 currently substitutes 85/12 for absent rows with null/omitted values.
    // Keep absent children visible, but exclude their measurements until BE fixes this.
    const selected =
      kind === 'pickup'
        ? rows.filter((row) => row.id === onlyId && row.changed)
        : kind === 'health'
          ? rows.filter((row) => !isAbsent(row.student))
          : rows;
    if (!selected.length || (kind === 'pickup' && !onlyId)) {
      if (kind === 'health')
        setMessage({ info: true, text: 'Không có học sinh có mặt cần ghi số đo.' });
      return;
    }
    let records;
    try {
      records = selected.map(({ student, value }) => toDailyRecord(kind, student, value, date, t));
    } catch (error) {
      setMessage({ error: true, text: error.message });
      return;
    }
    running.current = true;
    setIsSaving(true);
    setMessage(null);
    try {
      // Check roster and recorded values before overwriting a full day's results.
      const fresh = await query.refetch();
      if (!isCurrent()) return;
      if (fresh.isError) throw fresh.error;
      const freshById = new Map(fresh.data.map((student) => [String(student.id), student]));
      const conflict =
        fresh.data.length !== baseline.length ||
        rows.some(({ id, student }) => {
          const latest = freshById.get(id);
          const before = initialById.get(id) || student;
          return (
            !latest ||
            !initialById.has(id) ||
            (selected.some((row) => row.id === id) &&
              JSON.stringify(initialRecord(kind, latest)) !==
                JSON.stringify(initialRecord(kind, before))) ||
            ((kind === 'health' || kind === 'pickup') &&
              (latest.rawStatus !== before.rawStatus || latest.isPresent !== before.isPresent))
          );
        });
      if (conflict) {
        setNeedsReload(true);
        setMessage({
          error: true,
          text: 'Dữ liệu đã thay đổi trên máy chủ. Bản nháp vẫn còn; tải lại để đối chiếu trước khi lưu.',
        });
        return;
      }
      // Revalidate the currently authorized pickup choices after refetch.
      if (kind === 'pickup')
        records = selected.map(({ id, value }) =>
          toDailyRecord(kind, freshById.get(id), value, date, t)
        );
      await mutation.mutateAsync(records);
      if (!isCurrent()) return;
      const result = await query.refetch();
      await refreshRelatedRecords();
      if (!isCurrent()) return;
      const confirmed =
        !result.isError &&
        records.every((record) =>
          recordMatches(
            kind,
            result.data?.find((student) => String(student.id) === record.studentId),
            record
          )
        ) &&
        (kind !== 'health' ||
          rows
            .filter(({ student }) => isAbsent(student))
            .every(({ id }) => {
              const before = freshById.get(id);
              const after = result.data?.find((student) => String(student.id) === id);
              return (
                after &&
                JSON.stringify(initialRecord('health', before)) ===
                  JSON.stringify(initialRecord('health', after))
              );
            }));
      setNeedsReload(!confirmed);
      if (confirmed) acceptSavedRows(result.data, new Set(selected.map(({ id }) => id)));
      setMessage(
        confirmed
          ? kind === 'pickup'
            ? {
                text: 'Đã ghi nhận đón {name}.',
                values: { name: selected[0].student.name || selected[0].student.code },
              }
            : { text: SAVED_MESSAGES[kind], values: { count: records.length } }
          : {
              error: true,
              text: 'Máy chủ đã nhận yêu cầu nhưng dữ liệu đọc lại chưa khớp. Hãy tải lại để kiểm tra.',
            }
      );
    } catch (error) {
      if (!isCurrent()) return;
      setNeedsReload(true);
      const detail = error.response?.data?.message;
      setMessage({
        error: true,
        text:
          typeof detail === 'string'
            ? detail
            : 'Chưa xác nhận được kết quả lưu. Hãy tải lại để kiểm tra trước khi thử lại.',
      });
    } finally {
      running.current = false;
      setIsSaving(false);
    }
  }

  async function undoPickup(studentId) {
    if (
      kind !== 'pickup' ||
      !canEdit ||
      !isCurrent() ||
      running.current ||
      needsReload ||
      !query.isSuccess ||
      !baseline
    )
      return;
    const before = rows.find(({ id }) => id === studentId)?.student;
    if (!before?.isPresent || !before.isDismissed) return;

    running.current = true;
    setIsSaving(true);
    setMessage(null);
    try {
      const fresh = await query.refetch();
      if (!isCurrent()) return;
      if (fresh.isError) throw fresh.error;
      const latest = fresh.data.find((student) => String(student.id) === studentId);
      if (
        !latest?.isPresent ||
        !latest.isDismissed ||
        DISMISSAL_FIELDS.some((field) => latest[field] !== before[field])
      ) {
        throw new Error('Ghi nhận đón trẻ đã thay đổi. Hãy tải lại trước khi hủy.');
      }

      await cancelMutation.mutateAsync(studentId);
      if (!isCurrent()) return;
      const result = await query.refetch();
      await refreshRelatedRecords();
      if (!isCurrent()) return;
      const after = result.data?.find((student) => String(student.id) === studentId);
      if (
        result.isError ||
        !after ||
        after.isDismissed ||
        DISMISSAL_FIELDS.some((field) => after[field])
      ) {
        throw new Error('Chưa xác nhận được kết quả hủy. Hãy tải lại để kiểm tra.');
      }

      acceptSavedRows([after], new Set([studentId]));
      setMessage({
        text: 'Đã hủy ghi nhận đón trẻ của {name}.',
        values: { name: before.name || before.code },
      });
    } catch (error) {
      if (!isCurrent()) return;
      setNeedsReload(true);
      setMessage({
        error: true,
        text:
          error.response?.data?.message ||
          (error.isAxiosError
            ? 'Chưa xác nhận được kết quả hủy. Hãy tải lại để kiểm tra.'
            : error.message),
      });
    } finally {
      running.current = false;
      setIsSaving(false);
    }
  }

  return {
    rows,
    slot,
    canEdit,
    update,
    save,
    undoPickup,
    message,
    needsReload,
    reload,
    canReload: Boolean(valid),
    isSaving,
    hasChangesToSave: rows.some((row) => row.changed),
    changedCount: rows.filter((row) => row.changed).length,
    hasUserEdits: rows.some((row) => row.edited),
    loading: Boolean(
      valid &&
      ((query.isSuccess && baseline === null) ||
        (isAssessment && timetable.query.isPending) ||
        (query.isPending && (!isAssessment || slot?.activityId)))
    ),
    error: !valid
      ? 'Tài khoản, ngày hoặc tác vụ không hợp lệ.'
      : (isAssessment &&
          (timetable.query.error ||
            (!timetable.query.isPending &&
              !slot?.activityId &&
              'Hoạt động này không còn trong lịch hoặc chưa có mã đánh giá.'))) ||
        query.error,
  };
}
