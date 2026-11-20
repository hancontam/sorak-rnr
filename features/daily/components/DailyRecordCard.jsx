import { MessageSquareText, SlidersHorizontal } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { statusBadgeVariant } from '@/lib/status-badge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { ASSESSMENT_OPTIONS, ATTENDANCE_OPTIONS, decimal, isAbsent } from '../utils/daily-records';
import { StudentHeader } from './StudentHeader';

// Khung một hàng trong danh sách gọn: các hàng nối liền, viền chung, không bo góc.
export function RecordRow({ first, className, children }) {
  return (
    <View
      className={cn(
        'gap-2 border-x border-b border-border bg-card px-3 py-2.5',
        first && 'border-t',
        className
      )}>
      {children}
    </View>
  );
}

// Chọn một trạng thái dạng segmented (radio), thấp để danh sách hiện được nhiều bé.
function StatusSegments({ options, value, disabled, onChange, t }) {
  return (
    <View
      accessibilityRole="radiogroup"
      className={cn('flex-row bg-muted p-0.5', disabled && 'opacity-60')}>
      {options.map(([key, label]) => {
        const selected = key === value;
        return (
          <Pressable
            key={key}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            hitSlop={{ top: 6, bottom: 6 }}
            onPress={() => onChange(key)}
            className={cn(
              // Giữ sẵn lớp shadow từ lần render đầu như TabsTrigger; thêm shadow lúc chạy làm NativeWind lỗi.
              'min-h-8 min-w-0 flex-1 items-center justify-center px-1 py-1 shadow-none shadow-black/5 active:opacity-70',
              selected && 'bg-primary shadow-sm'
            )}>
            <Text
              // Màn hẹp (360 dp) hoặc chữ lớn: xuống tối đa 2 dòng thay vì cắt chữ.
              numberOfLines={2}
              className={cn(
                'text-center text-2xs font-medium leading-4 text-muted-foreground',
                selected && 'font-semibold text-primary-foreground'
              )}>
              {t(label)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Ô số đo nhập nhanh ngay trên hàng; nút −/+ và bước nhanh nằm trong sheet chi tiết.
function QuickMeasure({ label, unit, value, editable, onChange }) {
  return (
    <View className="min-w-0 flex-1 flex-row items-center border border-input bg-background pl-2">
      <Text className="text-2xs text-muted-foreground">{label}</Text>
      <Input
        value={value}
        onChangeText={(text) => onChange(text.replace(',', '.'))}
        editable={editable}
        keyboardType="decimal-pad"
        accessibilityLabel={label}
        placeholder=""
        className="h-8 min-w-0 flex-1 border-0 bg-transparent px-1 text-center font-mono text-sm shadow-none"
      />
      <Text className="pr-2 text-2xs text-muted-foreground">{unit}</Text>
    </View>
  );
}

export function DailyRecordCard({ kind, row, first, editable, locked, onChange, onOpenDetail }) {
  const t = useTranslation();
  const { student, value } = row;
  const options = kind === 'attendance' ? ATTENDANCE_OPTIONS : ASSESSMENT_OPTIONS;
  const skipHealth = kind === 'health' && isAbsent(student);
  if (locked)
    return (
      <LockedRecord kind={kind} row={row} first={first} options={options} absent={skipHealth} />
    );
  const canWrite = editable && !skipHealth;
  const height = decimal(value.height ?? '');
  const weight = decimal(value.weight ?? '');
  const bmi = height > 0 && weight > 0 ? (weight / (height / 100) ** 2).toFixed(1) : '';
  const unknownStatus =
    (kind === 'attendance' || kind === 'assessment') &&
    value.status &&
    !options.some(([key]) => key === value.status);
  const hasNote = Boolean(value.note?.trim());

  return (
    <RecordRow first={first}>
      <StudentHeader
        compact
        name={student.name}
        code={student.code}
        avatarUrl={row.avatarUrl}
        right={
          <View className="flex-row items-center gap-1.5">
            {skipHealth ? (
              <Badge variant="outline">
                <Text>{t('Vắng')}</Text>
              </Badge>
            ) : canWrite && row.changed ? (
              <Badge variant="code">
                <Text>{t('Chưa lưu')}</Text>
              </Badge>
            ) : row.recorded ? (
              <Badge variant="secondary">
                <Text>{t('Đã ghi')}</Text>
              </Badge>
            ) : null}
            {!skipHealth ? (
              <Button
                variant="ghost"
                size="icon-sm"
                accessibilityLabel={
                  kind === 'health'
                    ? t('Chi tiết số đo và ghi chú của {name}', { name: student.name })
                    : t('Ghi chú cho {name}', { name: student.name })
                }
                onPress={onOpenDetail}>
                <Icon
                  as={kind === 'health' ? SlidersHorizontal : MessageSquareText}
                  size={16}
                  className={hasNote ? 'text-primary' : 'text-muted-foreground'}
                />
                {hasNote ? (
                  <View className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" />
                ) : null}
              </Button>
            ) : null}
          </View>
        }
      />
      {kind === 'health' ? (
        skipHealth ? (
          <Text className="text-2xs text-muted-foreground">
            {student.height > 0 || student.weight > 0
              ? t(
                  'Hệ thống đang có số đo cho ngày này: {height} cm · {weight} kg. Hãy kiểm tra lại với nhà trường.',
                  { height: student.height || '—', weight: student.weight || '—' }
                )
              : t('Vắng — không ghi số đo mới.')}
          </Text>
        ) : (
          <View className="flex-row items-center gap-2">
            <QuickMeasure
              label={t('Cao')}
              unit="cm"
              value={value.height ?? ''}
              editable={canWrite}
              onChange={(next) => onChange({ height: next })}
            />
            <QuickMeasure
              label={t('Nặng')}
              unit="kg"
              value={value.weight ?? ''}
              editable={canWrite}
              onChange={(next) => onChange({ weight: next })}
            />
            <Text className="w-14 text-right font-mono text-2xs text-muted-foreground">
              {/* Chưa đủ số đo thì để trống, giữ cột thẳng hàng. */}
              {bmi ? `BMI ${bmi}` : ''}
            </Text>
          </View>
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
      {hasNote && kind !== 'health' ? (
        <Text numberOfLines={1} className="text-2xs text-muted-foreground">
          {value.note}
        </Text>
      ) : null}
      {unknownStatus ? (
        <Text className="text-2xs text-destructive">
          {t('Trạng thái chưa hỗ trợ: {status}. Cần kiểm tra lại trước khi lưu.', {
            status: value.status,
          })}
        </Text>
      ) : null}
    </RecordRow>
  );
}

// Ngày đã qua hoặc chưa tới: chỉ hiện giá trị đã ghi trên máy chủ, không còn ô nhập.
function LockedRecord({ kind, row, first, options, absent }) {
  const t = useTranslation();
  const { student, value } = row;
  const statusLabel = options.find(([key]) => key === value.status)?.[1];
  const height = decimal(value.height ?? '');
  const weight = decimal(value.weight ?? '');
  const bmi = height > 0 && weight > 0 ? (weight / (height / 100) ** 2).toFixed(1) : '';
  const badge = absent ? (
    <Badge variant="outline">
      <Text>{t('Vắng')}</Text>
    </Badge>
  ) : !row.recorded ? (
    <Badge variant="outline">
      <Text>{t('Chưa ghi nhận')}</Text>
    </Badge>
  ) : kind !== 'health' ? (
    <Badge variant={statusBadgeVariant(kind, value.status)}>
      <Text>{statusLabel ? t(statusLabel) : value.status}</Text>
    </Badge>
  ) : (
    <Text className="font-mono text-xs">
      {[`${value.height} cm`, `${value.weight} kg`, bmi && `BMI ${bmi}`]
        .filter(Boolean)
        .join(' · ')}
    </Text>
  );
  return (
    <RecordRow first={first}>
      <StudentHeader
        compact
        name={student.name}
        code={student.code}
        avatarUrl={row.avatarUrl}
        right={badge}
      />
      {row.recorded && value.note ? (
        <Text numberOfLines={2} className="text-2xs leading-4 text-muted-foreground">
          {value.note}
        </Text>
      ) : null}
    </RecordRow>
  );
}
