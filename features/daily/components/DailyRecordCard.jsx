import { View } from 'react-native';

import { MeasureField } from '@/components/shared/MeasureField';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { ASSESSMENT_OPTIONS, ATTENDANCE_OPTIONS, decimal, isAbsent } from '../utils/daily-records';

export function DailyRecordCard({ kind, row, editable, onChange }) {
  const t = useTranslation();
  const { student, value } = row;
  const options = kind === 'attendance' ? ATTENDANCE_OPTIONS : ASSESSMENT_OPTIONS;
  const skipHealth = kind === 'health' && isAbsent(student);
  const canWrite = editable && !skipHealth;
  const height = decimal(value.height ?? '');
  const weight = decimal(value.weight ?? '');
  const bmi = height > 0 && weight > 0 ? (weight / (height / 100) ** 2).toFixed(1) : '';

  return (
    <Card className="gap-3 p-4 shadow-none">
      <View className="gap-1">
        <Text className="text-sm font-semibold">{student.name || student.code}</Text>
        <Text className="text-xs text-muted-foreground">{student.code}</Text>
      </View>
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
        <>
          <View className="flex-row flex-wrap gap-2">
            {options.map(([key, label]) => {
              const selected = key === value.status;
              return (
                <Button
                  key={key}
                  size="sm"
                  variant={selected ? 'default' : 'outline'}
                  disabled={!canWrite}
                  accessibilityState={{ selected, disabled: !canWrite }}
                  onPress={() => onChange({ status: key })}>
                  <Text className="text-xs">{t(label)}</Text>
                </Button>
              );
            })}
          </View>
        </>
      )}
      {!skipHealth ? (
        <Field
          label={t('Ghi chú')}
          value={value.note}
          onChangeText={(note) => onChange({ note })}
          editable={canWrite}
        />
      ) : null}
      {(kind === 'attendance' || kind === 'assessment') &&
      value.status &&
      !options.some(([key]) => key === value.status) ? (
        <Text className="text-xs text-destructive">
          {t('Trạng thái máy chủ chưa hỗ trợ: {status}. Cần kiểm tra lại trước khi lưu.', {
            status: value.status,
          })}
        </Text>
      ) : null}
    </Card>
  );
}

function Field({ label, ...props }) {
  return (
    <View className="gap-1.5">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Input accessibilityLabel={label} className="text-sm" {...props} />
    </View>
  );
}
