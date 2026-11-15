// Đánh giá tăng trưởng từ z-score backend trả (WHO), cùng ngưỡng với web
// (sorak-web WhoGrowthCharts.evaluateChildGrowth). Khác web: thiếu z-score thì trả null,
// không mặc định "Đạt chuẩn". tone: danger | warn | info | ok.

function zValue(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function heightForAge(record) {
  const hz = zValue(record.zscoreHeight ?? record.heightZscore);
  if (hz === null) return null;
  if (hz < -3) return { label: 'Thấp còi độ 2 (nặng)', tone: 'danger' };
  if (hz < -2) return { label: 'Thấp còi độ 1', tone: 'warn' };
  if (hz > 2) return { label: 'Cao hơn tuổi', tone: 'info' };
  return { label: 'Đạt chuẩn', tone: 'ok' };
}

export function weightStatus(record) {
  const wz = zValue(record.zscoreWeight ?? record.weightZscore);
  const bz = zValue(record.zscoreBmi ?? record.bmiZscore);
  if (wz === null && bz === null) return null;
  if (bz !== null) {
    if (bz > 3) return { label: 'Béo phì', tone: 'danger' };
    if (bz > 2) return { label: 'Thừa cân', tone: 'danger' };
    if (bz > 1.5 && (wz === null || wz > 1.5)) return { label: 'Nguy cơ thừa cân', tone: 'warn' };
    if (bz < -3) return { label: 'Gầy còm nặng', tone: 'danger' };
    if (bz < -2) return { label: 'Gầy còm', tone: 'warn' };
  }
  // BMI đạt chuẩn (hoặc không có): đối chiếu thêm cân nặng theo tuổi.
  if (wz !== null) {
    if (wz < -3) return { label: 'Suy dinh dưỡng nặng', tone: 'danger' };
    if (wz < -2) return { label: 'Nhẹ cân', tone: 'warn' };
    if (wz > 2) return { label: 'Cân nặng cao hơn tuổi', tone: 'info' };
  }
  return { label: 'Đạt chuẩn', tone: 'ok' };
}

// Như web: tài khoản hệ thống (mã HS, admin) hiển thị là cán bộ y tế.
export function recordedByLabel(name) {
  if (typeof name !== 'string' || !name.trim()) return null;
  if (/^HS\d+$/i.test(name.trim()) || /^admin$/i.test(name.trim())) return 'Cán bộ Y tế';
  return name.trim();
}
