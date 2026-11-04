import { Text } from '@/components/ui/text';
import { useState } from 'react';
import { Image, View } from 'react-native';
import { SvgUri } from 'react-native-svg';

export function StudentAvatar({ student, size = 40 }) {
  const [imageFailed, setImageFailed] = useState(false);
  const uri = student?.avatarUrl || student?.avatar;
  const isSvg = typeof uri === 'string' && /\.svg(?:\?|$)|\/svg\?/i.test(uri);
  const name = student?.fullName || student?.name || '?';

  return (
    <View
      className="shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted"
      style={{ width: size, height: size }}>
      {uri && !imageFailed ? (
        isSvg ? (
          <SvgUri width={size} height={size} uri={uri} onError={() => setImageFailed(true)} />
        ) : (
          <Image
            source={{ uri }}
            style={{ width: size, height: size }}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        )
      ) : (
        <Text className="text-sm font-semibold text-muted-foreground">
          {name.charAt(0).toUpperCase()}
        </Text>
      )}
    </View>
  );
}
