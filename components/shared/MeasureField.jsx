import { Minus, Plus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

function toNumber(text) {
  const value = Number(String(text ?? '').replace(',', '.'));
  return String(text ?? '').trim() && Number.isFinite(value) ? value : null;
}

// Ô số đo có nút −/+ và chip bước nhanh. Chỉ tăng/giảm từ số đã có, không tự điền số mặc định.
export function MeasureField({
  label,
  unit,
  value,
  onChange,
  steps = [0.1, 0.5, 1],
  decimals = 1,
  min = 0,
  max,
  editable = true,
}) {
  const t = useTranslation();
  const current = toNumber(value);
  const canStep = editable && current !== null;

  function shift(delta) {
    if (current === null) return;
    let next = Math.round((current + delta) * 10 ** decimals) / 10 ** decimals;
    if (next < min) next = min;
    if (max !== undefined && next > max) next = max;
    onChange(next.toFixed(decimals));
  }

  return (
    <View className="gap-1.5">
      <Text className="text-xs font-medium">{label}</Text>
      <View className="flex-row items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={!canStep}
          accessibilityLabel={t('Giảm {label}', { label })}
          onPress={() => shift(-steps[0])}>
          <Icon as={Minus} size={16} />
        </Button>
        <View className="min-w-0 flex-1 justify-center">
          <Input
            value={value}
            onChangeText={(text) => onChange(text.replace(',', '.'))}
            editable={editable}
            keyboardType="decimal-pad"
            accessibilityLabel={label}
            placeholder="—"
            className="pr-10 text-center font-mono text-sm"
          />
          {unit ? (
            <Text className="absolute right-3 text-2xs text-muted-foreground">{unit}</Text>
          ) : null}
        </View>
        <Button
          variant="outline"
          size="icon"
          disabled={!canStep}
          accessibilityLabel={t('Tăng {label}', { label })}
          onPress={() => shift(steps[0])}>
          <Icon as={Plus} size={16} />
        </Button>
      </View>
      {canStep ? (
        <View className="flex-row flex-wrap gap-1.5">
          {steps
            .flatMap((step) => [-step, step])
            .sort((a, b) => a - b)
            .map((delta) => (
              <Pressable
                key={delta}
                accessibilityRole="button"
                accessibilityLabel={`${delta > 0 ? '+' : ''}${delta} ${unit || ''}`}
                onPress={() => shift(delta)}
                className="h-8 min-w-12 items-center justify-center rounded-full bg-muted px-2.5 active:bg-accent">
                <Text className="font-mono text-2xs font-medium">
                  {delta > 0 ? '+' : '−'}
                  {Math.abs(delta)}
                </Text>
              </Pressable>
            ))}
        </View>
      ) : null}
    </View>
  );
}
