import { useEffect, useState } from 'react';

import { schoolToday } from '../utils/schedule-date';

const SCHOOL_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Ngày hôm nay theo giờ trường (UTC+7), tự chuyển sang ngày mới lúc 0:00 kể cả khi app vẫn mở.
// Ghi nhận trong ngày chỉ được sửa tới 23:59, nên màn ghi nhận cần biết lúc qua ngày.
export function useSchoolToday() {
  const [today, setToday] = useState(schoolToday);
  useEffect(() => {
    const now = Date.now();
    const nextMidnight =
      Math.floor((now + SCHOOL_OFFSET_MS) / DAY_MS + 1) * DAY_MS - SCHOOL_OFFSET_MS;
    const timer = setTimeout(() => setToday(schoolToday()), nextMidnight - now + 500);
    return () => clearTimeout(timer);
  }, [today]);
  return today;
}
