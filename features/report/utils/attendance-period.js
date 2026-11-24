import { schoolToday } from '@/features/daily/utils/schedule-date';

// Tháng hiện tại theo giờ trường.
export function currentSchoolMonth() {
  const [year, month] = schoolToday().split('-').map(Number);
  return { month, year };
}

export function periodLabel(period, t) {
  if (period.type === 'month') return t('Tháng {month}/{year}', period);
  if (period.type === 'semester') return t(period.semester === 1 ? 'Học kỳ 1' : 'Học kỳ 2');
  return t('Cả năm');
}
