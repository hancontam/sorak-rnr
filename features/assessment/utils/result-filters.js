// Bộ lọc "Trạng thái đánh giá" của bảng giáo viên, cùng lựa chọn như bảng trên web.
const MONTHLY = [
  ['all', 'Tất cả trạng thái'],
  ['lotus', 'Đạt Bông Sen Cháu ngoan Bác Hồ'],
  ['training', 'Đang rèn luyện'],
  ['noted', 'Đã nhận xét'],
  ['notNoted', 'Chưa nhận xét'],
  ['feedback', 'Có phản hồi phụ huynh'],
];
const SEMESTER = [
  ['all', 'Tất cả trạng thái'],
  ['noted', 'Đã nhận xét'],
  ['notNoted', 'Chưa nhận xét'],
];

const filled = (value) => typeof value === 'string' && value.trim() !== '';

export function statusFilters(monthly) {
  return monthly ? MONTHLY : SEMESTER;
}

export function matchesStatus(monthly, status, student) {
  switch (status) {
    case 'lotus':
      return monthly && student.isLotus === true;
    case 'training':
      return monthly && student.isLotus !== true;
    case 'noted':
      return filled(student.teacherNotes);
    case 'notNoted':
      return !filled(student.teacherNotes);
    case 'feedback':
      return monthly && filled(student.parentFeedback);
    default:
      return true;
  }
}
