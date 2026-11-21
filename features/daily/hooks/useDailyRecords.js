import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { studentAvatarUrl } from '@/lib/student-avatar';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useTranslation } from '@/shared/i18n/useLanguage';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { assignedClass } from '@/features/auth/utils/class-assignment';
import { useClassStudents } from '@/features/report/hooks/useClassStudents';

import { getDailyRecords, saveDailyRecords } from '../api/daily-records.api';
import {
  assessmentLockedFor,
  DAILY_ACTIONS,
  draftRecord,
  initialRecord,
  isAbsent,
  recordMatches,
  toDailyRecord,
} from '../utils/daily-records';
import { calendarDate, schoolToday } from '../utils/schedule-date';
import { dayActivities, dayCalendar } from '../utils/timetable-model';
import { useSchoolToday } from './useSchoolToday';
import { timetableQuery, useTimetable } from './useTimetable';

const SAVED_MESSAGES = {
  attendance: 'Đã lưu điểm danh cho {count} học sinh.',
  health: 'Đã lưu số đo sức khỏe cho {count} học sinh.',
  assessment: 'Đã lưu đánh giá cho {count} học sinh.',
};

// Bản ghi đã có trên máy chủ (để hiện "Đã ghi" và đổi nút thành Cập nhật).
function isRecorded(kind, initial, student) {
  if (kind === 'pickup') return student.isDismissed === true;
  if (kind === 'attendance') return student.isAttendanceRecorded === true;
  if (kind === 'health') return Boolean(initial.height && initial.weight);
  return Boolean(initial.status);
}

// Khóa + hàm tải dùng chung cho màn ghi nhận và phần tải sẵn từ Thời khóa biểu / màn hoạt động.
// Lịch dùng lại bản vừa tải (còn mới trong 60 giây) thay vì tải lại tuần 37 KB mỗi lần mở màn;
// sau khi lưu, refreshRelatedRecords đánh dấu lịch cũ nên lần đọc lại vẫn lấy mới.
export function dailyRecordsQuery({ client, user, kind, date, slot }) {
  const classId = assignedClass(user).classId;
  return {
    queryKey: ['daily-records', user?.id, classId, kind, date, slot?.id, slot?.activityId],
    queryFn: ({ signal }) =>
      getDailyRecords({
        kind,
        classId,
        date,
        slot,
        signal,
        loadTimetable: () =>
          client.fetchQuery({ ...timetableQuery(user, date), staleTime: 60_000 }),
      }),
  };
}

// Tải sẵn dữ liệu ghi nhận (điểm danh, sức khỏe, đón trẻ hoặc đánh giá một hoạt động) để mở màn là
// thấy ngay; màn vẫn tải lại ở nền khi mở. Chỉ giáo viên, chỉ ngày đã có lịch.
export function usePrefetchDailyRecords({ date, kinds, slot, enabled = true }) {
  const client = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const ready =
    enabled &&
    user?.role === AUTH_ROLES.teacher &&
    assignedClass(user).classId &&
    calendarDate(date);
  const kindsKey = kinds.join(',');
  useEffect(() => {
    if (!ready) return;
    for (const kind of kindsKey.split(',')) {
      if (kind === 'assessment' && !slot?.activityId) continue;
      client.prefetchQuery({
        ...dailyRecordsQuery({ client, user, kind, date, slot }),
        staleTime: 30_000,
      });
    }
  }, [client, user, date, kindsKey, slot?.id, slot?.activityId, ready]);
}

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
  // Ghi nhận chỉ làm và cập nhật trong ngày (tới 23:59 giờ trường) và không làm trong ngày nghỉ
  // (lịch năm học hoặc cuối tuần không có lịch); cần lịch để biết ngày nghỉ trước khi cho sửa.
  const today = useSchoolToday();
  const lock =
    valid && timetable.query.data ? dayCalendar(timetable.query.data, date, false).lock : null;
  const canEdit = Boolean(valid && date === today && timetable.query.data && !lock);
  const params = { kind, classId: assignment.classId, date, slot };
  const recordsQuery = dailyRecordsQuery({ client, user, kind, date, slot });
  const query = useQuery({
    ...recordsQuery,
    enabled: Boolean(valid && (!isAssessment || slot?.activityId)),
    refetchOnWindowFocus: false,
  });
  const hasDrafts = Object.keys(drafts).length > 0;
  // Mở màn có thể hiện bản cache cũ trước rồi bản mới về sau. Khi giáo viên chưa sửa gì (và không có
  // xung đột đang chờ tải lại), lấy bản mới nhất làm gốc để ô nhập hiện đúng giá trị trên máy chủ.
  useEffect(() => {
    if (!query.data || query.data === baseline) return;
    if (baseline === null || (!hasDrafts && !needsReload && !running.current))
      setBaseline(query.data);
  }, [query.data, baseline, hasDrafts, needsReload]);
  const initialById = new Map((baseline || []).map((student) => [String(student.id), student]));
  const rows = (query.data || []).map((student) => {
    const id = String(student.id);
    const initial = initialRecord(kind, initialById.get(id) || student);
    const defaultDraft = draftRecord(kind, initial, student);
    const value = drafts[id] || defaultDraft;
    const fields = Object.keys(initial);
    const changed = fields.some((field) => initial[field] !== value[field]);
    const edited = fields.some((field) => defaultDraft[field] !== value[field]);
    const avatarUrl =
      student.avatarUrl ||
      avatars.get(id) ||
      studentAvatarUrl({ studentCode: student.code, fullName: student.name });
    return {
      id,
      student,
      value,
      changed,
      edited,
      avatarUrl,
      recorded: isRecorded(kind, initial, student),
    };
  });

  const mutation = useMutation({
    mutationFn: (records) => saveDailyRecords({ ...params, records }),
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
    if (isAssessment && assessmentLockedFor(row.student).includes(patch.status)) return;
    setMessage(null);
    setDrafts((current) => ({ ...current, [id]: { ...row.value, ...current[id], ...patch } }));
  }

  const [isSaving, setIsSaving] = useState(false);
  // patch (chỉ dùng cho đón trẻ): giá trị vừa chọn trong sheet, lưu ngay trong cùng lần bấm nên
  // không chờ bản nháp kịp render lại.
  async function save(onlyId, patch) {
    if (!canEdit || running.current || needsReload || !query.isSuccess || !baseline) return;
    if (patch && onlyId) update(onlyId, patch);
    const source =
      patch && onlyId
        ? rows.map((row) =>
            row.id === onlyId ? { ...row, value: { ...row.value, ...patch }, changed: true } : row
          )
        : rows;
    // Màn có thể mở từ trước 0:00: kiểm tra lại ngày ngay lúc bấm lưu.
    if (date !== schoolToday()) {
      setMessage({ error: true, text: 'Đã qua ngày ghi nhận. Dữ liệu ngày này chỉ còn xem.' });
      return;
    }
    // Validate the whole relevant roster, never the filtered list visible on screen.
    // Test2 currently substitutes 85/12 for absent rows with null/omitted values.
    // Keep absent children visible, but exclude their measurements until BE fixes this.
    const selected =
      kind === 'pickup'
        ? source.filter((row) => row.id === onlyId && row.changed)
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
          text: 'Dữ liệu vừa được cập nhật ở nơi khác. Thay đổi của bạn vẫn còn; tải lại để xem trước khi lưu.',
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
      // Làm mới lịch trước khi đọc lại: số đo, ghi chú điểm danh và trạng thái vắng nằm trong lịch,
      // còn lần đọc lại dùng lịch trong cache 60 giây nên đọc trước sẽ so với bản cũ.
      await refreshRelatedRecords();
      if (!isCurrent()) return;
      const result = await query.refetch();
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
              text: 'Hệ thống đã nhận yêu cầu nhưng dữ liệu đọc lại chưa khớp. Hãy tải lại để kiểm tra.',
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

  return {
    rows,
    slot,
    canEdit,
    isFuture: Boolean(valid && date > today),
    lock,
    update,
    save,
    message,
    needsReload,
    reload,
    canReload: Boolean(valid),
    isSaving,
    hasChangesToSave: rows.some((row) => row.changed),
    hasRecorded: rows.some((row) => row.recorded),
    // Hai loại cần lưu: giáo viên đã sửa (edited), và bé chưa có ghi nhận nên được chọn sẵn mặc định
    // (Có mặt / Đạt) — chưa ai chỉnh nhưng vẫn phải lưu mới thành ghi nhận.
    editedCount: rows.filter((row) => row.edited).length,
    prefilledCount: rows.filter((row) => row.changed && !row.edited).length,
    hasUserEdits: rows.some((row) => row.edited),
    loading: Boolean(
      valid &&
      ((query.isSuccess && baseline === null) ||
        timetable.query.isPending ||
        (query.isPending && (!isAssessment || slot?.activityId)))
    ),
    error: !valid
      ? 'Tài khoản, ngày hoặc tác vụ không hợp lệ.'
      : // Mọi loại ghi nhận cần lịch để biết ngày nghỉ, kể cả đón trẻ.
        timetable.query.error ||
        (isAssessment &&
          !timetable.query.isPending &&
          !slot?.activityId &&
          'Hoạt động này không còn trong lịch hoặc chưa có mã đánh giá.') ||
        query.error,
  };
}
