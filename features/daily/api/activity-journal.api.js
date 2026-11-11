import { apiClient } from '@/shared/api/client';

export async function getActivityJournal({ studentId, signal }) {
  const { data: response } = await apiClient.get('/parent/home', { signal });
  const data = response?.data;
  if (response?.success !== true || !data) throw new Error('Invalid parent home response');
  if (
    ![data.student?.id, data.student?.publicId].some(
      (id) => id != null && String(id) === String(studentId)
    )
  ) {
    throw new Error('Activity journal does not match the signed-in child');
  }
  const entries = data.timeline;
  if (
    !Array.isArray(entries) ||
    entries.some(
      (item) => item?.id == null || typeof item.title !== 'string' || !item.title.trim()
    ) ||
    new Set(entries.map((item) => String(item.id))).size !== entries.length
  ) {
    throw new Error('Invalid activity journal entries');
  }
  return {
    studentName: text(data.student.fullName) || text(data.student.name),
    entries: entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      time: text(entry.time),
      description: text(entry.description),
      objective: text(entry.objective),
      badge: text(entry.badge),
      notes: text(entry.notes),
      status: text(entry.status),
      isDone: entry.isDone === true,
    })),
  };
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}
