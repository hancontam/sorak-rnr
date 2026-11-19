// Cùng quy tắc với backend (class.service.js): ảnh đã tải lên, nếu không có thì DiceBear critters theo
// mã học sinh. Dùng cho bé có trong kết quả/ghi nhận nhưng không còn trong danh sách lớp hiện tại
// (đã chuyển lớp, nghỉ học) nên không ghép được avatar từ danh sách lớp.
const CRITTERS_BACKGROUND = 'ff2e63,00c2a8,ffb300,3d5afe,8e24aa,00e676';

export function studentAvatarUrl({ avatarUrl, studentCode, fullName } = {}) {
  if (avatarUrl) return avatarUrl;
  const seed = studentCode || fullName;
  if (!seed) return '';
  return `https://api.dicebear.com/10.x/critters/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${CRITTERS_BACKGROUND}`;
}
