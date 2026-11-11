import { SvgUri } from 'react-native-svg';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

export function AccountAvatar({ user, className }) {
  const t = useTranslation();
  const uri = [user.avatarUrl, user.avatar]
    .find((value) => typeof value === 'string' && value.trim())
    ?.trim();
  const name = user.fullName || user.name || user.username || 'Sorak';
  const initial = Array.from(name.trim())[0]?.toUpperCase() || 'S';
  const isSvg = uri && (/\.svg(?:[?#]|$)/i.test(uri) || /\/svg(?:[/?#]|$)/i.test(uri));

  return (
    <Avatar alt={t('Ảnh đại diện của {name}', { name })} className={className} key={uri}>
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
