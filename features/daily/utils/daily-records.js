import { schoolClock } from './schedule-date';

export const DAILY_ACTIONS = {
  attendance: 'Điểm danh',
  health: 'Sức khỏe',
  pickup: 'Đón trẻ',
  assessment: 'Đánh giá hoạt động',
};

export const ATTENDANCE_OPTIONS = [
  ['PRESENT', 'Có mặt'],
  ['EXCUSED_ABSENCE', 'Vắng có phép'],
  ['UNEXCUSED_ABSENCE', 'Vắng không phép'],
];

export const ASSESSMENT_OPTIONS = [
  ['ACHIEVED', 'Đạt'],
  ['NOT_ACHIEVED', 'Chưa đạt'],
  ['OUTSTANDING', 'Vượt trội'],
];

const DEFAULT_ASSESSMENT_NOTES = {
  ACHIEVED: 'Con đạt yêu cầu',
  NOT_ACHIEVED: 'Cần cô hỗ trợ thêm',
  OUTSTANDING: 'Con xuất sắc',
};

function statusIn(options, value) {
  return options.some(([status]) => status === value) ? value : '';
}

export function isAbsent(student) {
  return ['EXCUSED_ABSENCE', 'UNEXCUSED_ABSENCE'].includes(
    student.rawStatus || student.attendanceStatus
  );
}

export function draftRecord(kind, initial) {
  if ((kind === 'attendance' || kind === 'assessment') && !initial.status) {
    return { ...initial, status: kind === 'attendance' ? 'PRESENT' : 'ACHIEVED' };
  }
  return initial;
}

export function pickupOptions(student) {
  return [
    ...(student.parents || []).map((person) => ({ ...person, key: `parent:${person.id}` })),
    ...(student.authorizations || []).map((person) => ({
      ...person,
      key: `authorization:${person.id}`,
    })),
  ].filter((person) => person.id && person.name);
}

export function initialRecord(kind, student) {
  if (kind === 'health') {
    return {
      height: student.height > 0 ? String(student.height) : '',
      weight: student.weight > 0 ? String(student.weight) : '',
      note: student.healthNote || '',
    };
  }
  if (kind === 'assessment') {
    return {
      status: student.assessment?.status ?? '',
      note: student.assessment?.note || '',
    };
  }
  if (kind === 'pickup') {
    const matches = pickupOptions(student).filter(
      (option) =>
        option.name === student.pickupPersonName &&
        (option.phone || '') === (student.pickupPersonPhone || '') &&
        (option.relationship || '') === (student.pickupRelationship || '') &&
        (option.citizenId || '') === (student.pickupCitizenId || '') &&
        (option.photoUrl || '') === (student.pickupPhotoUrl || '')
    );
    // The saved attendance record has a person snapshot, not an authorization ID.
    // Keep the history visible; require an explicit choice if it is ambiguous or expired.
    const person = matches.length === 1 ? matches[0] : null;
    return {
      personKey: person?.key || '',
      time: schoolClock(student.checkOutTime),
      note: student.pickupNote || '',
    };
  }

  // Recorded flag comes from the dismissal overview, not inferred from check-in time.
  const status = student.isAttendanceRecorded === false ? '' : student.rawStatus;
  return { status: status === 'UNRECORDED' ? '' : (status ?? ''), note: student.notes || '' };
}

export function decimal(value) {
  const normalized = value.trim().replace(',', '.');
  return /^\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : NaN;
}

export function toDailyRecord(kind, student, draft, date) {
  const studentId = String(student.id);
  const note = draft.note.trim();
  if (kind === 'health') {
    if (isAbsent(student)) {
      throw new Error('Không gửi số đo cho học sinh vắng.');
    }
    if (student.isAttendanceRecorded !== true || student.rawStatus !== 'PRESENT') {
      throw new Error(`${student.name}: cần hoàn tất điểm danh trước khi ghi sức khỏe.`);
    }
    const height = decimal(draft.height);
    const weight = decimal(draft.weight);
    if (!Number.isFinite(height) || !Number.isFinite(weight) || height <= 0 || weight <= 0) {
      throw new Error(`${student.name}: nhập chiều cao và cân nặng lớn hơn 0.`);
    }
    return { studentId, height, weight, note };
  }
  if (kind === 'pickup') {
    const person = pickupOptions(student).find((option) => option.key === draft.personKey);
    if (!student.isPresent || !person || !/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.time)) {
      throw new Error('Cần điểm danh có mặt, chọn người đón và nhập giờ theo HH:mm.');
    }
    return {
      studentId,
      checkOutTime: new Date(`${date}T${draft.time}:00+07:00`).toISOString(),
      pickupPersonName: person.name,
      pickupRelationship: person.relationship,
      pickupPersonPhone: person.phone,
      pickupCitizenId: person.citizenId,
      pickupPhotoUrl: person.photoUrl,
      pickupNote: note,
    };
  }
  const options = kind === 'attendance' ? ATTENDANCE_OPTIONS : ASSESSMENT_OPTIONS;
  if (!statusIn(options, draft.status)) throw new Error(`${student.name}: cần chọn trạng thái.`);
  return kind === 'attendance'
    ? { studentId, status: draft.status, notes: note }
    : {
        studentId,
        status: draft.status,
        note,
      };
}

export function recordMatches(kind, student, record) {
  if (!student) return false;
  const actual = initialRecord(kind, student);
  if (kind === 'health') {
    return (
      Number(actual.height) === record.height &&
      Number(actual.weight) === record.weight &&
      actual.note === record.note
    );
  }
  if (kind === 'pickup') {
    return (
      student.isDismissed &&
      student.pickupPersonName === record.pickupPersonName &&
      (student.pickupRelationship || '') === (record.pickupRelationship || '') &&
      (student.pickupPersonPhone || '') === (record.pickupPersonPhone || '') &&
      (student.pickupCitizenId || '') === (record.pickupCitizenId || '') &&
      (student.pickupPhotoUrl || '') === (record.pickupPhotoUrl || '') &&
      Date.parse(student.checkOutTime) === Date.parse(record.checkOutTime) &&
      actual.note === record.pickupNote
    );
  }
  const expectedNote = record.notes ?? record.note;
  const defaultNote =
    kind === 'assessment'
      ? DEFAULT_ASSESSMENT_NOTES[record.status]
      : record.status === 'EXCUSED_ABSENCE'
        ? 'Nghỉ có phép'
        : undefined;
  // Some deployed versions supply their own note when an empty note is saved.
  const noteMatches =
    actual.note === expectedNote || (!expectedNote && actual.note === defaultNote);
  return actual.status === record.status && noteMatches;
}
