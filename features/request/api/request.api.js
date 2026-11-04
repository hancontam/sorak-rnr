import { apiClient } from '@/shared/api/client';

export async function getParentRequests() {
  const response = await apiClient.get('/parent/requests');
  return response.data?.data || { requests: [], student: null, siblings: [] };
}

export async function createParentRequest(payload) {
  const response = await apiClient.post('/parent/requests/pickup', payload);
  return response.data?.data;
}

export async function cancelParentRequest(requestId) {
  const response = await apiClient.post(`/parent/requests/pickup/${encodeURIComponent(requestId)}/cancel`);
  return response.data?.data;
}

export async function getTeacherAuthorizations(classId) {
  if (!classId) return { authorizations: [], stats: { pendingCount: 0, totalCount: 0 } };
  const response = await apiClient.get(`/attendance/classes/${encodeURIComponent(classId)}/authorizations`);
  return response.data?.data || { authorizations: [], stats: { pendingCount: 0, totalCount: 0 } };
}

export async function approveAuthorization(classId, authId) {
  const response = await apiClient.patch(
    `/attendance/classes/${encodeURIComponent(classId)}/authorizations/${encodeURIComponent(authId)}/approve`
  );
  return response.data?.data;
}

export async function rejectAuthorization(classId, authId, reason = '') {
  const response = await apiClient.patch(
    `/attendance/classes/${encodeURIComponent(classId)}/authorizations/${encodeURIComponent(authId)}/reject`,
    { reason }
  );
  return response.data?.data;
}
