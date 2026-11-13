import { CalendarDays } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { FieldTrigger } from '@/components/shared/FieldTrigger';
import { formatDateId, MonthCalendar, monthIdOf } from '@/components/shared/MonthCalendar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

// Chọn khoảng ngày bằng lịch tháng trong bottom sheet; giá trị vẫn là chuỗi YYYY-MM-DD như form cũ.
export function DateRangeField({ label, startId, endId, minDateId, todayId, disabled, onChange }) {
  const t = useTranslation();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState({ startId, endId });
  const [monthId, setMonthId] = useState(monthIdOf(startId || todayId) || monthIdOf(minDateId));

  function show() {
    setRange({ startId, endId });
    setMonthId(monthIdOf(startId || todayId) || monthIdOf(minDateId));
    setOpen(true);
  }

  function press(id) {
    setRange((current) =>
      // Khoảng một ngày coi như mới có ngày đầu: chạm ngày sau đó sẽ kéo dài thành khoảng.
      !current.startId ||
      (current.endId && current.endId !== current.startId) ||
      id < current.startId
        ? { startId: id, endId: undefined }
        : { startId: current.startId, endId: id }
    );
  }

  function confirm() {
    if (!range.startId) return;
    onChange({ startId: range.startId, endId: range.endId || range.startId });
    setOpen(false);
  }

  const summary =
    startId && endId
      ? startId === endId
        ? formatDateId(startId, locale)
        : `${formatDateId(startId, locale)} – ${formatDateId(endId, locale)}`
      : '';
  const draft = range.startId
    ? range.endId && range.endId !== range.startId
      ? `${formatDateId(range.startId, locale)} – ${formatDateId(range.endId, locale)}`
      : formatDateId(range.startId, locale)
    : t('Chọn ngày bắt đầu');

  return (
    <>
      <FieldTrigger
        label={label}
        icon={CalendarDays}
        value={summary}
        placeholder={t('Chọn ngày')}
        mono
        disabled={disabled}
        onPress={show}
      />
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={label}
        description={draft}
        closeLabel={t('Đóng')}
        enableContentPanningGesture={false}>
        <MonthCalendar
          monthId={monthId}
          onMonthChange={setMonthId}
          ranges={[range]}
          minDateId={minDateId}
          onDayPress={press}
        />
        <View className="flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onPress={() => setRange({ startId: undefined, endId: undefined })}>
            <Text>{t('Chọn lại')}</Text>
          </Button>
          <Button className="flex-1" disabled={!range.startId} onPress={confirm}>
            <Text>{t('Xong')}</Text>
          </Button>
        </View>
      </BottomSheet>
    </>
  );
}
