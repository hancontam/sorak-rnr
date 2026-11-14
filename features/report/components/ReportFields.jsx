import { isValidElement } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { displayValue } from '../utils/report-format';

/**
 * Danh sách nhãn–giá trị trong một Card, mỗi dòng cách nhau bằng đường kẻ mảnh.
 * fields: [label, value, { mono }?]; value có thể là phần tử React (Badge).
 * `badge` nằm cạnh tiêu đề, `children` (thao tác) ở cuối.
 */
export function ReportFields({ title, badge, fields, children }) {
  const t = useTranslation();
  return (
    <Card className="gap-0 py-0">
      {title || badge ? (
        <View className="flex-row items-start gap-2 px-4 pb-2.5 pt-3.5">
          <Text className="min-w-0 flex-1 text-sm font-semibold leading-5">{title}</Text>
          {badge}
        </View>
      ) : null}
      {fields.map(([label, value, options], index) => {
        const element = isValidElement(value);
        const shown = element ? null : displayValue(value);
        return (
          <View
            key={label}
            className={cn(
              'flex-row gap-3 px-4 py-2.5',
              (index > 0 || title || badge) && 'border-t border-border'
            )}>
            <Text className="w-[38%] text-xs leading-5 text-muted-foreground">{t(label)}</Text>
            {element ? (
              <View className="min-w-0 flex-1 flex-row">{value}</View>
            ) : (
              <Text
                className={cn(
                  'min-w-0 flex-1 text-xs leading-5',
                  shown === null && 'text-muted-foreground',
                  options?.mono && shown !== null && 'font-mono'
                )}>
                {shown ?? t('Chưa có thông tin')}
              </Text>
            )}
          </View>
        );
      })}
      {children ? <View className="border-t border-border px-4 py-3">{children}</View> : null}
    </Card>
  );
}
