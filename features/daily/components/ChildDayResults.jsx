import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

export function ChildDayResults({ results, forActivity = false }) {
  const t = useTranslation();
  return (
    <View className="gap-2.5 pt-3">
      <Text className="text-sm font-semibold">
        {forActivity
          ? t('Kết quả của con trong hoạt động này')
          : t('Kết quả hoạt động của con trong ngày')}
      </Text>
      <Card className="gap-0 py-0">
        {results.length ? (
          results.map((result, index) => (
            <View
              key={result.id}
              className={cn('gap-1.5 px-4 py-3', index > 0 && 'border-t border-border')}>
              <View className="flex-row items-start gap-2">
                <Text className="min-w-0 flex-1 text-xs font-semibold leading-5">
                  {result.title || t('Hoạt động trong ngày')}
                </Text>
                <Badge variant="secondary">
                  <Text>{t(result.result)}</Text>
                </Badge>
              </View>
              {result.note ? <Text className="text-xs leading-5">{result.note}</Text> : null}
              {result.teacher ? (
                <Text className="text-2xs text-muted-foreground">{result.teacher}</Text>
              ) : null}
            </View>
          ))
        ) : (
          <Text className="px-4 py-3.5 text-xs text-muted-foreground">
            {forActivity
              ? t('Chưa có kết quả được ghi nhận cho hoạt động này.')
              : t('Chưa có kết quả được ghi nhận cho ngày này.')}
          </Text>
        )}
      </Card>
    </View>
  );
}
