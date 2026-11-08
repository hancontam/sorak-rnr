import { SvgUri } from 'react-native-svg';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';

export function AccountAvatar({ user, className }) {
  const uri = [user.avatarUrl, user.avatar]
    .find((value) => typeof value === 'string' && value.trim())
    ?.trim();
  const name = user.fullName || user.name || user.username || 'Sorak';
  const initial = Array.from(name.trim())[0]?.toUpperCase() || 'S';
  const isSvg = uri && (/\.svg(?:[?#]|$)/i.test(uri) || /\/svg(?:[/?#]|$)/i.test(uri));

  return (
    <Avatar alt={`Ảnh đại diện của ${name}`} className={className} key={uri}>
      <AvatarFallback>
        <Text className="text-sm font-semibold text-muted-foreground">{initial}</Text>
      </AvatarFallback>
      {isSvg ? (
        <SvgUri uri={uri} width="100%" height="100%" style={{ position: 'absolute' }} />
      ) : uri ? (
        <AvatarImage source={{ uri }} />
      ) : null}
    </Avatar>
  );
}
