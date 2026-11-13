import { View } from 'react-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { studentStatus } from '../utils/report-format';

export function StudentSummary({ student, className }) {
  const t = useTranslation();
  return (
    <View className="flex-row items-center gap-3">
      <AccountAvatar user={student} className="size-11" />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text numberOfLines={1} className="text-base font-semibold tracking-tight">
          {student.fullName || t('Học sinh')}
        </Text>
        <Text numberOfLines={1} className="text-2xs text-muted-foreground">
          <Text className="font-mono text-2xs text-muted-foreground">{student.studentCode}</Text>
          {className ? ` · ${className}` : ''}
        </Text>
      </View>
      <Badge variant="secondary">
        <Text>{t(student.statusLabel || studentStatus(student.status))}</Text>
      </Badge>
    </View>
  );
}
