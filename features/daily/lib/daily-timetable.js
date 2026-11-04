// Display framework shared with the web TeacherTimetableGrid ROUTINE_SLOTS.
// These are daily routine labels/times, not scheduled educational activities.
export const DAILY_ROUTINES = [
  { key: 'ARRIVAL_PLAY', title: 'Đón trẻ, chơi', startTime: '07:15', endTime: '08:00' },
  { key: 'MORNING_EXERCISE', title: 'Thể dục sáng', startTime: '08:00', endTime: '08:30' },
  { key: 'DIRECTED_STUDY', title: 'Học', startTime: '08:30', endTime: '09:15' },
  { key: 'CORNER_PLAY', title: 'Chơi, hoạt động ở các góc', startTime: '09:15', endTime: '10:15' },
  { key: 'OUTDOOR_PLAY', title: 'Chơi ngoài trời', startTime: '10:15', endTime: '11:00' },
  {
    key: 'AFTERNOON_ACTIVITY',
    title: 'Chơi, hoạt động theo ý thích',
    startTime: '14:00',
    endTime: '14:45',
  },
  { key: 'RETURN_CHILD', title: 'Vệ sinh, trả trẻ', startTime: '15:30', endTime: '16:30' },
];

export function getTeacherDayActivities(slots = [], date) {
  const scheduled = slots.filter((slot) => slot.fullDate === date);
  const weekday = new Date(`${date}T12:00:00`).getDay();
  // Do not imply that the school opens on weekends when there is no schedule.
  if ((weekday === 0 || weekday === 6) && !scheduled.length) return [];

  const rows = DAILY_ROUTINES.flatMap((routine) => {
    const matches = scheduled.filter((slot) => slot.routineSlot === routine.key);
    if (matches.length) return matches;
    return [
      {
        id: `routine:${date}:${routine.key}`,
        routineSlot: routine.key,
        fullDate: date,
        startTime: routine.startTime,
        endTime: routine.endTime,
        title: routine.title,
        statusLabel: 'Chưa xếp hoạt động',
        isPlaceholder: true,
      },
    ];
  });
  // Keep future/unknown backend routine types instead of dropping real activities.
  rows.push(
    ...scheduled.filter(
      (slot) => !DAILY_ROUTINES.some((routine) => routine.key === slot.routineSlot)
    )
  );
  return rows
    .sort(
      (a, b) =>
        String(a.startTime).localeCompare(String(b.startTime)) ||
        Number(a.orderIndex || a.order_index || 0) - Number(b.orderIndex || b.order_index || 0)
    )
    .map((slot) => ({
      ...slot,
      time: slot.startTime,
      activity: slot.title || slot.shortTitle || slot.contentTitle || slot.name || 'Hoạt động',
      description:
        slot.objective || slot.planObjective || slot.description || slot.contentTitle || '',
    }));
}
