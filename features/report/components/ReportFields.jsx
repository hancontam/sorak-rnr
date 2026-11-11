import { View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { displayValue } from '../utils/report-format';

export function ReportFields({ title, fields, children }) {
  const t = useTranslation();
  return (
    <Card className="gap-3 rounded-2xl p-3.5 shadow-none">
      {title ? <Text className="text-sm font-semibold leading-5">{title}</Text> : null}
      {fields.map(([label, value]) => (
        <View key={label} className="flex-row gap-3">
          <Text className="w-[38%] text-xs leading-5 text-muted-foreground">{t(label)}</Text>
          <Text className="min-w-0 flex-1 text-xs leading-5">
            {displayValue(value) ?? t('Chưa có thông tin')}
          </Text>
        </View>
      ))}
      {children}
    </Card>
  );
}
