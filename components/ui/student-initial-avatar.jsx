import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Image, View } from 'react-native';

const PALETTE = [
  'bg-brand/20',
  'bg-emerald-200 dark:bg-emerald-900',
  'bg-amber-200 dark:bg-amber-900',
  'bg-sky-200 dark:bg-sky-900',
  'bg-rose-200 dark:bg-rose-900',
  'bg-violet-200 dark:bg-violet-900',
];

// Avatar học sinh: ưu tiên ảnh thật từ avatarUrl của backend; thiếu ảnh hoặc tải lỗi thì hiện chữ cái đầu.
// Màu nền chọn ổn định theo mã học sinh để danh sách không đổi màu mỗi lần render.
export function StudentInitialAvatar({ name, code, uri, size = 32 }) {
  const [failed, setFailed] = React.useState(false);
  const seed = (code || name || '?')
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  const initial = (name || '?').trim().slice(0, 1).toUpperCase();

  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        onError={() => setFailed(true)}
        style={{ width: size, height: size, borderRadius: 8 }}
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View
      className={`items-center justify-center rounded-lg ${PALETTE[seed % PALETTE.length]}`}
      style={{ width: size, height: size }}>
      <Text className="text-sm font-semibold text-foreground">{initial}</Text>
    </View>
  );
}
