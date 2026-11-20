import { View } from 'react-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { Text } from '@/components/ui/text';

// Dòng nhận diện học sinh trong hàng ghi nhận: avatar (dicebear khi chưa có ảnh thật), tên, mã HS.
// compact dùng cho danh sách gọn: avatar nhỏ, tên một dòng.
export function StudentHeader({ name, code, avatarUrl, right, compact = false }) {
  return (
    <View className={compact ? 'flex-row items-center gap-2.5' : 'flex-row items-center gap-3'}>
      <AccountAvatar
        user={{ fullName: name || code, avatarUrl }}
        className={compact ? 'size-8' : 'size-9'}
      />
      <View className="min-w-0 flex-1">
        <Text numberOfLines={1} className="text-sm font-semibold">
          {name || code}
        </Text>
        {code ? (
          <Text numberOfLines={1} className="font-mono text-2xs text-muted-foreground">
            {code}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
