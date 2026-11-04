export function formatDate(value) {
  if (!value) return 'Chưa có';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatGender(value) {
  const gender = String(value || '').toUpperCase();
  if (gender === 'FEMALE' || gender === 'NỮ') return 'Nữ';
  if (gender === 'MALE' || gender === 'NAM') return 'Nam';
  return 'Chưa có';
}

export function getRequestError(error) {
  return (
    error?.response?.data?.message || error?.message || 'Không thể tải dữ liệu. Vui lòng thử lại.'
  );
}
