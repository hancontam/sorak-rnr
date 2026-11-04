// Thứ tự và nhãn 5 lĩnh vực phát triển dùng chung cho giáo viên và phụ huynh.
export const DOMAIN_FIELDS = [
  { key: 'physical', label: 'Thể chất' },
  { key: 'cognitive', label: 'Nhận thức' },
  { key: 'language', label: 'Ngôn ngữ' },
  { key: 'socioEmotional', label: 'TC – KNXH' },
  { key: 'aesthetic', label: 'Thẩm mỹ' },
];

export function formatPercent(value) {
  return typeof value === 'number' ? `${value}%` : '--';
}

// domainBreakdown có dạng { rate, achieved, total }; null khi học sinh chưa có mục tiêu nào được đánh giá.
export function formatDomainResult(breakdown) {
  if (!breakdown || typeof breakdown.rate !== 'number') return '--';
  return `${breakdown.rate}% · ${breakdown.achieved}/${breakdown.total}`;
}

export function formatAttendance(attendance) {
  if (!attendance) return '--';
  const { presentDays, totalDays, rate } = attendance;
  if (!totalDays) return '--';
  return `${formatPercent(rate)} · ${presentDays}/${totalDays}`;
}

export function formatSemesterPeriod(classInfo) {
  const dates = classInfo?.semesterDates;
  if (!dates?.dateRangeLabel) return '';
  const until = classInfo?.calculatedUntilVN;
  return until ? `${dates.dateRangeLabel} · Tính đến ${until}` : dates.dateRangeLabel;
}

export function formatMonthlyStats(weekly) {
  if (!weekly) return { attendance: '--', goals: '--', health: '--' };
  return {
    attendance: `${weekly.attendanceRate ?? 0}% · ${weekly.attendancePresent ?? 0}/${weekly.attendanceTotal ?? 0}`,
    goals: `${weekly.goalsRate ?? 0}% · ${weekly.goalsAchieved ?? 0}/${weekly.goalsTotal ?? 0}`,
    health: weekly.healthStatus || '--',
  };
}

export function initialOf(name) {
  return (name || '?').trim().slice(0, 1).toUpperCase();
}
