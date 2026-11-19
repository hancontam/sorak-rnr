// Màu nhãn trạng thái dùng chung, chỉ trong design system: xanh primary đặc cho việc cần chú ý hoặc
// mức cao nhất, xanh nhạt (secondary) cho trạng thái bình thường, xám (neutral) cho việc đã đóng,
// navy (dark) cho kết quả tiêu cực. Không dùng xanh lá/vàng.
const VARIANTS = {
  attendance: {
    PRESENT: 'secondary',
    LATE: 'outline',
    EXCUSED_ABSENCE: 'neutral',
    ABSENT: 'dark',
    UNEXCUSED_ABSENCE: 'dark',
  },
  assessment: { OUTSTANDING: 'default', ACHIEVED: 'secondary', NOT_ACHIEVED: 'dark' },
  authorization: {
    PENDING: 'default',
    APPROVED: 'secondary',
    REJECTED: 'dark',
    CANCELLED: 'neutral',
    EXPIRED: 'neutral',
  },
};

export function statusBadgeVariant(kind, status) {
  return VARIANTS[kind]?.[status] || 'outline';
}
