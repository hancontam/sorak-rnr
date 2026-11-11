import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

export function PasswordField({ label, ...props }) {
  const t = useTranslation();
  const [visible, setVisible] = useState(false);
  return (
    <View className="gap-1.5">
      <Text className="text-xs font-semibold">{label}</Text>
      <View className="relative justify-center">
        <Input
          accessibilityLabel={label}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          className="min-h-11 rounded-xl pr-11 text-xs"
          {...props}
        />
        <Button
          variant="ghost"
          size="icon"
          accessibilityLabel={visible ? t('Ẩn mật khẩu') : t('Hiện mật khẩu')}
          onPress={() => setVisible(!visible)}
          className="absolute right-0.5 size-10">
          <Icon as={visible ? EyeOff : Eye} size={15} className="text-muted-foreground" />
        </Button>
      </View>
    </View>
  );
}
