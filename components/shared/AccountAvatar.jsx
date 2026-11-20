import { useState } from 'react';
import { View } from 'react-native';
import { SvgUri } from 'react-native-svg';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

// Avatar DiceBear trả SVG; vẽ nhiều SVG trong danh sách (15+ bé) nặng luồng giao diện và gây treo
// (ANR) trên máy yếu, lại tải lại mỗi lần. DiceBear có cùng hình dạng PNG nên đổi sang PNG 128px để
// Image tự cache và vẽ nhẹ. Lúc đang tải chỉ hiện ô xám trơn; chữ cái chỉ dùng khi không có ảnh
// hoặc ảnh lỗi.
const DICEBEAR_SVG = /^(https:\/\/api\.dicebear\.com\/[^/]+\/[^/]+)\/svg(\?.*)?$/i;

function imageUri(uri) {
  const match = DICEBEAR_SVG.exec(uri || '');
  if (!match) return uri;
  const query = match[2] ? `${match[2]}&size=128` : '?size=128';
  return `${match[1]}/png${query}`;
}

export function AccountAvatar({ user, className }) {
  const t = useTranslation();
  const [failed, setFailed] = useState(false);
  const raw = [user.avatarUrl, user.avatar]
    .find((value) => typeof value === 'string' && value.trim())
    ?.trim();
  const uri = imageUri(raw);
  const name = user.fullName || user.name || user.username || 'Sorak';
  const initial = Array.from(name.trim())[0]?.toUpperCase() || 'S';
  const isSvg = Boolean(uri && (/\.svg(?:[?#]|$)/i.test(uri) || /\/svg(?:[/?#]|$)/i.test(uri)));
  const showInitial = !uri || failed;

  return (
    <Avatar alt={t('Ảnh đại diện của {name}', { name })} className={className} key={uri}>
      <AvatarFallback>
        {showInitial ? (
          <Text className="text-sm font-semibold text-muted-foreground">{initial}</Text>
        ) : null}
      </AvatarFallback>
      {!uri || failed ? null : isSvg ? (
        <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
          <SvgUri uri={uri} width="100%" height="100%" onError={() => setFailed(true)} />
        </View>
      ) : (
        <AvatarImage source={{ uri }} onError={() => setFailed(true)} />
      )}
    </Avatar>
  );
}
