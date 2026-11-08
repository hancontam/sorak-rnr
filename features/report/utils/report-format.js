export function displayValue(value) {
  return value === null || value === undefined || value === ''
    ? 'Chưa có thông tin'
    : String(value);
}

export function parseDate(value) {
  if (typeof value !== 'string') return null;
  const parts = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(value);
  if (!parts) return null;
  const [, y, m, d] = parts.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
    ? date
    : null;
}

export function formatDate(value) {
  const date = parseDate(value);
  if (!date) return 'Chưa có ngày hợp lệ';
  return `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`;
}

export function genderKey(value) {
  if (['MALE', 'NAM'].includes(String(value).toUpperCase())) return 'boys';
  if (['FEMALE', 'NỮ'].includes(String(value).toUpperCase())) return 'girls';
  return null;
}

export function formatGender(value) {
  return { boys: 'Nam', girls: 'Nữ' }[genderKey(value)] || 'Chưa có thông tin';
}

export function numberValue(value) {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean')
    return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function measurement(value, unit) {
  const number = numberValue(value);
  return number !== null && number > 0
    ? `${number.toLocaleString('vi-VN')} ${unit}`
    : 'Chưa có số đo hợp lệ';
}

export const studentStatus = (value) =>
  ({
    ACTIVE: 'Đang học',
    ENROLLED: 'Đang học',
    STUDYING: 'Đang học',
    GRADUATED: 'Đã tốt nghiệp',
    TRANSFERRED: 'Đã chuyển lớp',
    TRANSFERRED_SCHOOL: 'Chuyển trường',
    RESERVED: 'Bảo lưu',
    DROPPED_OUT: 'Thôi học',
    INACTIVE: 'Ngừng học',
  })[value] || 'Chưa rõ trạng thái';
export const attendanceStatus = (value) =>
  ({
    PRESENT: 'Có mặt',
    ABSENT: 'Vắng',
    EXCUSED_ABSENCE: 'Vắng có phép',
    UNEXCUSED_ABSENCE: 'Vắng không phép',
    LATE: 'Đến muộn',
  })[value] || 'Chưa rõ trạng thái';
export const assessmentStatus = (value) =>
  ({ ACHIEVED: 'Đạt', OUTSTANDING: 'Vượt trội', NOT_ACHIEVED: 'Chưa đạt' })[value] ||
  'Chưa có kết quả';
export const authorizationStatus = (value) =>
  ({
    APPROVED: 'Đã duyệt',
    PENDING: 'Chờ duyệt',
    REJECTED: 'Từ chối',
    CANCELLED: 'Đã hủy',
    EXPIRED: 'Hết hạn',
  })[value] || 'Chưa rõ trạng thái';

export function reportError(error) {
  if (error?.response?.status === 403) return 'Bạn chưa được cấp quyền xem dữ liệu này.';
  if (error?.response?.status === 404) return 'Chưa tìm thấy hồ sơ hoặc lớp học này.';
  if (error?.response?.status === 401) return 'Phiên đăng nhập không còn hợp lệ.';
  if (error?.isAxiosError)
    return error.response
      ? 'Chưa tải được dữ liệu từ nhà trường. Hãy thử lại.'
      : 'Chưa kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
  return error?.message || 'Không thể tải báo cáo. Hãy thử lại.';
}

export function assignedClass(user) {
  const classes = user?.assignedClasses;
  if (!Array.isArray(classes))
    return {
      error: 'Tài khoản chưa có thông tin phân lớp. Hãy đăng nhập lại hoặc liên hệ nhà trường.',
    };
  if (classes.length > 1)
    return {
      error: 'Tài khoản được gắn nhiều lớp. Vui lòng liên hệ nhà trường kiểm tra phân công.',
    };
  if (!classes.length) return { classId: null };
  if (!classes[0]?.classId)
    return { error: 'Thông tin phân lớp thiếu mã lớp. Vui lòng liên hệ nhà trường.' };
  return { ...classes[0] };
}
