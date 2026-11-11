import { apiClient } from '@/shared/api/client';
import { getDismissalStudents } from '@/features/daily/api/daily-records.api';

function readData(response) {
  if (response.data?.success !== true || !response.data.data) {
    throw new Error('Máy chủ chưa xác nhận yêu cầu ủy quyền.');
  }
  return response.data.data;
}

function teacherPath(classId) {
  return `/attendance/classes/${encodeURIComponent(classId)}/authorizations`;
}

export async function getPickupRequests({ isParent, studentId, classId, date, signal }) {
  const data = readData(
    await apiClient.get(isParent ? '/parent/requests' : teacherPath(classId), {
      signal,
      params: isParent ? undefined : { date },
    })
  );
  if (isParent && String(data.student?.id) !== String(studentId)) {
    throw new Error('Danh sách ủy quyền không khớp học sinh của tài khoản.');
  }

  const requests = isParent ? data.requests : data.authorizations;
  if (
    !Array.isArray(requests) ||
    requests.some((item) => !item?.id) ||
    new Set(requests.map((item) => String(item.id))).size !== requests.length
  ) {
    throw new Error('Danh sách ủy quyền thiếu mã đơn hoặc chưa đúng định dạng.');
  }

  return { requests, stats: data.stats, student: data.student };
}

export async function getAuthorizationStudents({ classId, date, signal }) {
  return getDismissalStudents({ classId, date, signal });
}

export async function submitPickupRequest({ isParent, classId, action, id, body }) {
  if (!isParent && action === 'create') {
    const created = readData(
      await apiClient.post(teacherPath(classId), {
        studentId: body.studentId,
        pickupPersonName: body.pickup_person_name,
        pickupPersonPhone: body.pickup_person_phone,
        pickupCitizenId: body.pickup_citizen_id || null,
        relationship: body.relationship,
        startDate: body.start_date,
        endDate: body.end_date,
        note: body.note || null,
        photoUrl: body.photoUrl || null,
        status: 'APPROVED',
      })
    );
    // Create returns both internal id and publicId; list uses publicId as id.
    const createdId = created.publicId || created.id;
    if (!createdId) throw new Error('Máy chủ chưa trả mã đơn mới. Hãy tải lại danh sách.');
    return String(createdId);
  }
  if (isParent && action === 'create') {
    const created = readData(await apiClient.post('/parent/requests/pickup', body));
    if (!created.id) throw new Error('Máy chủ chưa trả mã đơn mới. Hãy tải lại danh sách.');
    return String(created.id);
  }
  if (isParent && action === 'cancel' && id) {
    readData(await apiClient.post(`/parent/requests/pickup/${encodeURIComponent(id)}/cancel`));
    return id;
  }
  if (!isParent && id && (action === 'approve' || action === 'reject')) {
    readData(
      await apiClient.patch(`${teacherPath(classId)}/${encodeURIComponent(id)}/${action}`, body)
    );
    return id;
  }
  throw new Error('Tài khoản không có quyền thực hiện thao tác này.');
}
