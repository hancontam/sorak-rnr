import { Pressable, View } from 'react-native';

import { MeasureField } from '@/components/shared/MeasureField';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { ASSESSMENT_OPTIONS, ATTENDANCE_OPTIONS, decimal, isAbsent } from '../utils/daily-records';
import { StudentHeader } from './StudentHeader';

// Chọn một trạng thái dạng segmented (radio) như showcase.
function StatusSegments({ options, value, disabled, onChange, t }) {
  return (
    <View
      accessibilityRole="radiogroup"
      className={cn('flex-row rounded-xl bg-muted p-1', disabled && 'opacity-60')}>
      {options.map(([key, label]) => {
        const selected = key === value;
        return (
          <Pressable
            key={key}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => onChange(key)}
            className={cn(
              // Giữ sẵn lớp shadow từ lần render đầu như TabsTrigger; thêm shadow lúc chạy làm NativeWind lỗi.
              'min-h-9 min-w-0 flex-1 items-center justify-center rounded-lg px-1 shadow-none shadow-black/5 active:opacity-70',
              selected && 'bg-background shadow-sm'
            )}>
            <Text
              numberOfLines={1}
              className={cn(
                'text-2xs font-medium text-muted-foreground',
                selected && 'font-semibold text-foreground'
              )}>
              {t(label)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function DailyRecordCard({ kind, row, editable, onChange }) {
  const t = useTranslation();
  const { student, value } = row;
  const options = kind === 'attendance' ? ATTENDANCE_OPTIONS : ASSESSMENT_OPTIONS;
  const skipHealth = kind === 'health' && isAbsent(student);
  const canWrite = editable && !skipHealth;
  const height = decimal(value.height ?? '');
  const weight = decimal(value.weight ?? '');
  const bmi = height > 0 && weight > 0 ? (weight / (height / 100) ** 2).toFixed(1) : '';
  const unknownStatus =
    (kind === 'attendance' || kind === 'assessment') &&
    value.status &&
    !options.some(([key]) => key === value.status);

  return (
    <Card className="gap-3 px-4 py-3.5">
      <StudentHeader
        name={student.name}
        code={student.code}
        avatarUrl={row.avatarUrl}
        right={
          skipHealth ? (
            <Badge variant="outline">
              <Text>{t('Vắng')}</Text>
            </Badge>
          ) : canWrite && row.changed ? (
            <Badge variant="code">
              <Text>{t('Chưa lưu')}</Text>
            </Badge>
          ) : null
        }
      />
      {kind === 'health' ? (
        skipHealth ? (
          <View className="gap-1">
            <Text className="text-xs text-muted-foreground">
              {t('Vắng — không ghi số đo mới.')}
            </Text>
            {student.height > 0 || student.weight > 0 ? (
              <Text className="text-xs text-muted-foreground">
                {t(
                  'Máy chủ đang có số đo cho ngày này: {height} cm · {weight} kg. Cần đối chiếu với nhà trường.',
                  { height: student.height || '—', weight: student.weight || '—' }
                )}
              </Text>
            ) : null}
          </View>
        ) : (
          <>
            <MeasureField
              label={t('Chiều cao')}
              unit="cm"
              value={value.height ?? ''}
              onChange={(height) => onChange({ height })}
              editable={canWrite}
              steps={[0.5, 1]}
            />
            <MeasureField
              label={t('Cân nặng')}
              unit="kg"
              value={value.weight ?? ''}
              onChange={(weight) => onChange({ weight })}
              editable={canWrite}
              steps={[0.1, 0.5]}
            />
            {bmi ? (
              <Text className="font-mono text-2xs text-muted-foreground">BMI {bmi} kg/m²</Text>
            ) : null}
          </>
        )
      ) : (
        <StatusSegments
          options={options}
          value={value.status}
          disabled={!canWrite}
          onChange={(status) => onChange({ status })}
          t={t}
        />
      )}
      {!skipHealth ? (
        <View className="gap-1.5">
          <Text className="text-2xs font-medium text-muted-foreground">{t('Ghi chú')}</Text>
          <Input
            accessibilityLabel={t('Ghi chú')}
            value={value.note}
            onChangeText={(note) => onChange({ note })}
            editable={canWrite}
          />
        </View>
      ) : null}
      {unknownStatus ? (
        <Text className="text-xs text-destructive">
          {t('Trạng thái máy chủ chưa hỗ trợ: {status}. Cần kiểm tra lại trước khi lưu.', {
            status: value.status,
          })}
        </Text>
      ) : null}
    </Card>
  );
}
