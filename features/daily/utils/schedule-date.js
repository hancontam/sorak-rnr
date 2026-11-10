const DAY_MS = 24 * 60 * 60 * 1000;
export const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

// Calendar dates are school dates, not UTC timestamps or the device's timezone.
export function schoolToday(now = new Date()) {
  return new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function schoolClock(value) {
  if (!value) return '';
  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isFinite(timestamp)
    ? new Date(timestamp + 7 * 60 * 60 * 1000).toISOString().slice(11, 16)
    : '';
}

export function calendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
}

export function shiftDays(value, days) {
  const date = calendarDate(value);
  if (!date) throw new Error('Ngày xem lịch không hợp lệ.');
  return new Date(date.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

export function weekDates(value) {
  const date = calendarDate(value);
  if (!date) throw new Error('Ngày xem lịch không hợp lệ.');
  const start = shiftDays(value, -((date.getUTCDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => shiftDays(start, index));
}

export function shortDate(value) {
  return `${Number(value.slice(8, 10))}/${Number(value.slice(5, 7))}`;
}

export function dayTitle(value) {
  const day = calendarDate(value)?.getUTCDay();
  if (day === undefined) return '';
  return `${['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][day]}, ${shortDate(value)}/${value.slice(0, 4)}`;
}

export function weekLabel(dates) {
  const [start] = dates;
  const end = dates[6];
  return start.slice(0, 7) === end.slice(0, 7)
    ? `Tuần ${Number(start.slice(8))}–${Number(end.slice(8))}`
    : `${shortDate(start)}–${shortDate(end)}`;
}

export function selectMonth(date, year, month) {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = Math.min(Number(date.slice(8)), lastDay);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
