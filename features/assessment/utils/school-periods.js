export const monthKey = ({ month, year }) => `${year}-${String(month).padStart(2, '0')}`;

export function monthLabel({ month, year }, locale) {
  if (locale !== 'en-US') return `Tháng ${month}/${year}`;
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1)));
}

export function resultDateLabel(date, fallback, locale) {
  if (locale !== 'en-US' || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return fallback;
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    return fallback;
  }
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(parsed);
}

export function schoolMonths(schoolYear, period, today) {
  const match =
    typeof schoolYear === 'string' && schoolYear.match(/\b(\d{4})\s*[-–—/]\s*(\d{4})\b/);
  // A returned month can identify the school year while its response is being refreshed.
  const yearFromPeriod =
    period?.month >= 9 ? period.year : period?.month <= 5 ? period.year - 1 : null;
  const startYear =
    match && Number(match[2]) === Number(match[1]) + 1 ? Number(match[1]) : yearFromPeriod;
  if (!Number.isInteger(startYear)) return [];

  const currentMonth = today.slice(0, 7);
  return Array.from({ length: 9 }, (_, index) => {
    const calendarMonth = 9 + index;
    const value = {
      month: ((calendarMonth - 1) % 12) + 1,
      year: startYear + (calendarMonth > 12 ? 1 : 0),
    };
    const key = monthKey(value);
    return {
      ...value,
      key,
      ended: key < currentMonth,
      status:
        key < currentMonth ? 'Đã kết thúc' : key === currentMonth ? 'Đang diễn ra' : 'Chưa diễn ra',
    };
  });
}
