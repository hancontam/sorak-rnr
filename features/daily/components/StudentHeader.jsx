import { View } from 'react-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { Text } from '@/components/ui/text';

// Dòng nhận diện học sinh trong thẻ ghi nhận: avatar (dicebear khi chưa có ảnh thật), tên, mã HS.
export function StudentHeader({ name, code, avatarUrl, right }) {
  return (
    <View className="flex-row items-center gap-3">
      <AccountAvatar user={{ fullName: name || code, avatarUrl }} className="size-9" />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text numberOfLines={1} className="text-sm font-semibold">
          {name || code}
        </Text>
        {code ? <Text className="font-mono text-2xs text-muted-foreground">{code}</Text> : null}
      </View>
      {right}
    </View>
  );
}
