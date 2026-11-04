import { Text } from '@/components/ui/text';
import { View } from 'react-native';

const PALETTE = [
  'bg-brand/20',
  'bg-emerald-200 dark:bg-emerald-900',
  'bg-amber-200 dark:bg-amber-900',
  'bg-sky-200 dark:bg-sky-900',
  'bg-rose-200 dark:bg-rose-900',
  'bg-violet-200 dark:bg-violet-900',
];

// Avatar vuông 32 dùng chữ cái đầu; màu chọn ổn định theo mã học sinh để danh sách không đổi màu mỗi lần render.
export function StudentInitialAvatar({ name, code, size = 32 }) {
  const seed = (code || name || '?')
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  const initial = (name || '?').trim().slice(0, 1).toUpperCase();

  return (
    <View
      className={`items-center justify-center rounded-lg ${PALETTE[seed % PALETTE.length]}`}
      style={{ width: size, height: size }}>
      <Text className="text-sm font-semibold text-foreground">{initial}</Text>
    </View>
  );
}
