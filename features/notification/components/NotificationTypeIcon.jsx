import {
  ArrowLeftRight,
  Award,
  Bell,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  FileHeart,
  Megaphone,
  UserCheck,
} from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';

import { isSchoolNews } from '../utils/notification-kind';

// Icon theo loại thông báo như web (resolveNotificationIcon). Loại cụ thể nằm ở data.type; trường
// type bên ngoài có khi chỉ là SCHOOL_ANNOUNCEMENT chung (đã thấy với PICKUP_AUTH_CREATED trên test2
// 20/11/2026), nên đọc data.type trước. Màu do nơi dùng đặt theo design system của app.
function iconOf(item) {
  const type = String(item?.data?.type || item?.type || '').toUpperCase();
  if (type.startsWith('TRANSFER')) return ArrowLeftRight;
  if (type.startsWith('PICKUP')) return UserCheck;
  if (type.startsWith('THEME') || type.startsWith('PLANNING')) return ClipboardCheck;
  if (type.startsWith('ATTENDANCE')) return CalendarCheck;
  if (type.startsWith('HEALTH') || type.startsWith('GROWTH')) return FileHeart;
  if (type.startsWith('ASSESSMENT') || type.startsWith('BEHAVIOR')) return Award;
  if (type.startsWith('ACADEMIC_CALENDAR')) return CalendarDays;
  if (type === 'SCHOOL_ANNOUNCEMENT' || isSchoolNews(item)) return Megaphone;
  return Bell;
}

export function NotificationTypeIcon({ item, size = 16, className }) {
  return <Icon as={iconOf(item)} size={size} className={className} />;
}
