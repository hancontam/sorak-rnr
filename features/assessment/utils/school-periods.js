export const monthKey = ({ month, year }) => `${year}-${String(month).padStart(2, '0')}`;
export const monthLabel = ({ month, year }) => `Tháng ${month}/${year}`;

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
