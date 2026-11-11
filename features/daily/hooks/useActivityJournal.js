import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';

import { getActivityJournal } from '../api/activity-journal.api';
import { schoolToday } from '../utils/schedule-date';

export function useActivityJournal() {
  const user = useAuthStore((state) => state.user);
  const studentId = user?.role === AUTH_ROLES.parent ? user.student?.id : undefined;
  const query = useQuery({
    queryKey: ['activity-journal', user?.id, studentId, schoolToday()],
    queryFn: ({ signal }) => getActivityJournal({ studentId, signal }),
    enabled: Boolean(user?.id && studentId),
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });
  return { query, studentId };
}
