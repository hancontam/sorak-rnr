import { WHO_REFERENCE } from '../data/who-reference';
import { genderKey, numberValue, parseDate } from './report-format';

// WHO tuổi tháng: số ngày từ ngày sinh đến ngày đo / 30.4375.
// Không dùng tuổi hiện tại, không ép điểm về mép 24/72 tháng.
export function measurementAge(birthDate, measuredDate) {
  const birth = parseDate(birthDate);
  const measured = parseDate(measuredDate);
  if (!birth || !measured || measured < birth) return null;
  return (measured - birth) / 86400000 / 30.4375;
}

export function growthChartData(student, history, metric) {
  const sex = genderKey(student.gender);
  const reference = WHO_REFERENCE[metric]?.[sex];
  const points = [];
  let outside = 0;
  let invalid = 0;
  for (const record of history) {
    const age = measurementAge(student.dateOfBirth, record.date);
    const value = numberValue(record[metric]);
    if (age === null || value === null || value <= 0) {
      invalid++;
      continue;
    }
    if (age < 24 || age > 72) {
      outside++;
      continue;
    }
    points.push({ age, value, record });
  }
  points.sort((a, b) => a.age - b.age);
  if (!reference) return { reference: null, points: [], outside, invalid };
  // Mở rộng trục dọc để số đo bất thường vẫn được nhìn thấy, không sửa số đo.
  const step = metric === 'height' ? 10 : 5;
  const values = [...reference.flatMap((r) => [r[1], r[5]]), ...points.map((p) => p.value)];
  const min = Math.max(0, Math.floor((Math.min(...values) - step / 2) / step) * step);
  const max = Math.ceil((Math.max(...values) + step / 2) / step) * step;
  return { reference, points, outside, invalid, min, max };
}

// Màu biểu đồ thống nhất web; vùng khoa học giữ cùng màu trên nền trắng ở cả hai theme.
export const GROWTH_COLORS = {
  high: '#FEF9C3',
  normal: '#D6F1FD',
  low: '#FED7AA',
  veryLow: '#EE7D8D',
  median: '#16A34A',
  child: '#2563EB',
  line: '#64748B',
  background: '#FFFFFF',
  text: '#334155',
};
