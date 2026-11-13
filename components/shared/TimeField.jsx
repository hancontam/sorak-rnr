import WheelPicker from '@quidone/react-native-wheel-picker';
import { Clock } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { View } from 'react-native';

import { FieldTrigger } from '@/components/shared/FieldTrigger';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { FONT_FAMILY } from '@/lib/fonts';
import { THEME } from '@/lib/theme';
import { useTranslation } from '@/shared/i18n/useLanguage';

const pad = (n) => String(n).padStart(2, '0');
const HOURS = Array.from({ length: 24 }, (_, value) => ({ value, label: pad(value) }));
const MINUTES = Array.from({ length: 60 }, (_, value) => ({ value, label: pad(value) }));
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

function split(value) {
  const match = TIME.exec(value || '');
  return match ? [Number(match[1]), Number(match[2])] : null;
}

// Chọn giờ HH:mm bằng hai cột cuộn trong bottom sheet. `now()` (nếu có) trả giờ hiện tại theo giờ trường.
export function TimeField({ label, value, disabled, onChange, now }) {
  const t = useTranslation();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);

  function show() {
    const [h, m] = split(value) || split(now?.()) || [0, 0];
    setHour(h);
    setMinute(m);
    setOpen(true);
  }

  function applyNow() {
    const current = split(now?.());
    if (!current) return;
    setHour(current[0]);
    setMinute(current[1]);
  }

  const wheel = {
    itemHeight: 40,
    visibleItemCount: 5,
    width: 72,
    enableScrollByTapOnItem: true,
    itemTextStyle: { fontFamily: FONT_FAMILY.mono.medium, fontSize: 20, color: theme.foreground },
    // Lớp nổi nằm trên chữ nên phải mờ, nếu không sẽ che giá trị đang chọn.
    overlayItemStyle: { backgroundColor: theme.foreground, borderRadius: 12, opacity: 0.06 },
  };

  return (
    <>
      <FieldTrigger
        label={label}
        icon={Clock}
        value={split(value) ? value : ''}
        placeholder={t('Chọn giờ')}
        mono
        disabled={disabled}
        onPress={show}
      />
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={label}
        closeLabel={t('Đóng')}
        enableContentPanningGesture={false}>
        <View
          className="flex-row items-center justify-center gap-2"
          accessibilityLabel={t('Giờ {time}', { time: `${pad(hour)}:${pad(minute)}` })}>
          <WheelPicker
            {...wheel}
            data={HOURS}
            value={hour}
            onValueChanged={({ item }) => setHour(item.value)}
          />
          <Text className="font-mono text-xl font-semibold">:</Text>
          <WheelPicker
            {...wheel}
            data={MINUTES}
            value={minute}
            onValueChanged={({ item }) => setMinute(item.value)}
          />
        </View>
        <View className="flex-row gap-2">
          {now ? (
            <Button variant="outline" className="flex-1" onPress={applyNow}>
              <Text>{t('Giờ hiện tại')}</Text>
            </Button>
          ) : null}
          <Button
            className="flex-1"
            onPress={() => {
              onChange(`${pad(hour)}:${pad(minute)}`);
              setOpen(false);
            }}>
            <Text>{t('Xong')}</Text>
          </Button>
        </View>
      </BottomSheet>
    </>
  );
}
