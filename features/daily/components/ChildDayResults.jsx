import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

export function ChildDayResults({ results, forActivity = false }) {
  const t = useTranslation();
  return (
    <View className="gap-3 pt-5">
      <Text className="text-sm font-semibold">
        {forActivity
          ? t('Kết quả của con trong hoạt động này')
          : t('Kết quả hoạt động của con trong ngày')}
      </Text>
      {results.length ? (
        results.map((result) => (
          <Card key={result.id} className="gap-2 p-3.5 shadow-none">
            <Text className="text-xs font-semibold leading-5">
              {result.title || t('Hoạt động trong ngày')}
            </Text>
            <Badge variant="secondary" className="self-start">
              <Text className="text-[10px]">{t(result.result)}</Text>
            </Badge>
            {result.note ? <Text className="text-xs leading-5">{result.note}</Text> : null}
            {result.teacher ? (
              <Text className="text-[11px] text-muted-foreground">{result.teacher}</Text>
            ) : null}
          </Card>
        ))
      ) : (
        <Text className="text-xs text-muted-foreground">
          {forActivity
            ? t('Chưa có kết quả được ghi nhận cho hoạt động này.')
            : t('Chưa có kết quả được ghi nhận cho ngày này.')}
        </Text>
      )}
    </View>
  );
}
