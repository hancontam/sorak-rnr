// Parent schedule supplies routine frames plus scheduled activities and the child's own results.
export function getParentDayActivities(schedule, date) {
  const routineSlots = schedule?.timetable?.routineSlots || [];
  const activities = (schedule?.timetable?.weeklyActivities || []).filter(
    (item) => item.isoDate === date
  );
  const assessments = (schedule?.slotAssessments || []).filter((item) => item.isoDate === date);
  const routineKeys = new Set(routineSlots.map((routine) => routine.slot));
  const frames = [...routineSlots];
  // Preserve backend activity types not covered by its standard routine frames.
  [...activities, ...assessments].forEach((item) => {
    if (routineKeys.has(item.routineSlot)) return;
    routineKeys.add(item.routineSlot);
    frames.push({
      id: item.routineSlot,
      slot: item.routineSlot,
      title: item.slotName || item.routineSlot,
      time: item.startTime || '',
    });
  });
  return frames.flatMap((routine) => {
    const [time, endTime] = (routine.time || '').split('–').map((value) => value.trim());
    const planned = activities.filter((item) => item.routineSlot === routine.slot);
    const evaluated = assessments.filter((item) => item.routineSlot === routine.slot);
    const rows = [...planned];
    evaluated.forEach((item) => {
      if (!planned.some((activity) => activity.title === item.activityTitle)) rows.push(item);
    });
    if (!rows.length)
      return [
        {
          id: routine.id,
          time,
          endTime,
          activity: routine.title,
          description: '',
          statusLabel: 'Khung sinh hoạt',
          isPlaceholder: true,
        },
      ];
    return rows.map((item) => {
      const result = item.activityTitle
        ? item
        : evaluated.find((record) => record.activityTitle === item.title);
      return {
        id: `${routine.id}:${item.id}`,
        time: item.startTime || time,
        endTime: item.endTime || endTime,
        activity: item.activityTitle || item.title,
        description: item.objective || item.goalTitle || '',
        statusLabel:
          result?.statusLabel || (item.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đã xếp lịch'),
        note: result?.notes || '',
        evaluatorName: result?.evaluatorName,
        preparation: item.preparation || '',
        procedure: item.procedure || '',
      };
    });
  });
}
