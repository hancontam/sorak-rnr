import { AUTH_ROLES } from './auth-roles';

export function describeAccount(user) {
  const student = user.student;
  return {
    id: user.id,
    role: user.role,
    username: user.username || student?.studentCode || user.employeeCode || '',
    fullName: student?.fullName || student?.name || user.fullName || user.name || '',
    avatarUrl: student?.avatarUrl || student?.avatar || user.avatarUrl || user.avatar || '',
    student: student
      ? { id: student.id, publicId: student.publicId, studentCode: student.studentCode }
      : null,
  };
}

export function matchesChild(account, data) {
  if (account?.role !== AUTH_ROLES.parent) return false;
  // Prefer the stable ID. A conflicting ID must never fall back to a matching name/code.
  if (data?.studentId != null) {
    return [account.student?.id, account.student?.publicId].some(
      (id) => id != null && String(id) === String(data.studentId)
    );
  }
  return Boolean(data?.studentCode && account.student?.studentCode === data.studentCode);
}

export function notificationAccount(accounts, user, data) {
  if (data?.studentId != null || data?.studentCode) {
    return accounts.find((account) => matchesChild(account, data))?.id ?? null;
  }
  // Legacy notifications without a child identity cannot select an inactive child.
  return accounts.filter((account) => account.role === AUTH_ROLES.parent).length > 1
    ? null
    : (user?.id ?? null);
}
