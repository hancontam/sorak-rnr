// Nhãn trạng thái đơn ủy quyền (khóa dịch tiếng Việt) và cách ghi thời gian hiệu lực.
export const REQUEST_STATUS = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn',
};

const dmy = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value.split('-').reverse().join('/') : value;

// Đơn một ngày chỉ hiện một ngày; khoảng ngày giữ đủ hai đầu.
export function requestPeriod(request) {
  return request.startDate && request.startDate === request.endDate
    ? dmy(request.startDate)
    : [request.startDate, request.endDate].filter(Boolean).map(dmy).join(' – ');
}
