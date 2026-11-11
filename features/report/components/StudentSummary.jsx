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
      <AccountAvatar user={student} className="size-10 rounded-xl" />
      <View className="min-w-0 flex-1 gap-1">
        <Text className="text-sm font-semibold leading-5">{student.fullName || t('Học sinh')}</Text>
        <Text className="text-[11px] leading-4 text-muted-foreground">
          {[student.studentCode, className].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <Badge variant="secondary" className="max-w-24">
        <Text className="text-[10px] leading-4">
          {t(student.statusLabel || studentStatus(student.status))}
        </Text>
      </Badge>
    </View>
  );
}
