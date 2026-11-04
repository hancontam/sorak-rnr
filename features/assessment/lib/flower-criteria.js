export const ATTENDANCE_PRESETS = [60, 70, 80, 90, 100];
export const GOAL_PRESETS = [50, 60, 70, 80, 100];

// Bốn trạng thái sức khỏe backend trả trong weeklyStats.healthStatus.
export const HEALTH_STATUS_OPTIONS = [
  'Bình thường',
  'Theo dõi nhẹ cân',
  'Theo dõi thừa cân/béo phì',
  'Theo dõi thấp còi',
];

export const DEFAULT_FLOWER_CRITERIA = {
  minAttendanceRate: 80,
  minGoalsRate: 70,
  allowedHealthStatuses: ['Bình thường', 'Theo dõi nhẹ cân'],
};

export function normalizeCriteria(value) {
  if (!value || typeof value !== 'object') return { ...DEFAULT_FLOWER_CRITERIA };
  const minAttendanceRate = Number(value.minAttendanceRate);
  const minGoalsRate = Number(value.minGoalsRate);
  const allowedHealthStatuses = Array.isArray(value.allowedHealthStatuses)
    ? value.allowedHealthStatuses.filter((status) => HEALTH_STATUS_OPTIONS.includes(status))
    : [...DEFAULT_FLOWER_CRITERIA.allowedHealthStatuses];

  return {
    minAttendanceRate:
      Number.isFinite(minAttendanceRate) && minAttendanceRate >= 0 && minAttendanceRate <= 100
        ? minAttendanceRate
        : DEFAULT_FLOWER_CRITERIA.minAttendanceRate,
    minGoalsRate:
      Number.isFinite(minGoalsRate) && minGoalsRate >= 0 && minGoalsRate <= 100
        ? minGoalsRate
        : DEFAULT_FLOWER_CRITERIA.minGoalsRate,
    allowedHealthStatuses,
  };
}

// Một tuần đủ điều kiện nhận hoa khi đạt cả ba tiêu chí đã cấu hình.
export function isWeekEligible(weekStats, criteria) {
  if (!weekStats) return false;
  const attendanceRate = Number(weekStats.attendanceRate ?? 0);
  const goalsRate = Number(weekStats.goalsRate ?? 0);
  const healthStatus = weekStats.healthStatus || 'Bình thường';
  const healthOk =
    criteria.allowedHealthStatuses.length === 0 ||
    criteria.allowedHealthStatuses.includes(healthStatus);

  return (
    attendanceRate >= criteria.minAttendanceRate && goalsRate >= criteria.minGoalsRate && healthOk
  );
}

// Quy tắc hoa sen giống web/backend: tháng 5 tuần cần từ 4 hoa, tháng 4 tuần cần đủ 4 hoa.
export function lotusTargetFor(totalWeeks) {
  const weeks = Number(totalWeeks) > 0 ? Number(totalWeeks) : 5;
  return weeks >= 5 ? 4 : weeks;
}

export function isLotusByRoses(rosesCount, totalWeeks) {
  return Number(rosesCount ?? 0) >= lotusTargetFor(totalWeeks);
}
