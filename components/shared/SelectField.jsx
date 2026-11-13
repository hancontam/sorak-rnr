import { ChevronsUpDown } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { FieldTrigger } from '@/components/shared/FieldTrigger';
import { BottomSheet, BottomSheetOption } from '@/components/ui/bottom-sheet';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

// Select trên mobile: ô giống Input, chạm mở sheet danh sách có dấu tích (theo mẫu showcase).
export function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled,
  emptyText,
  icon = ChevronsUpDown,
}) {
  const t = useTranslation();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <>
      <FieldTrigger
        label={label}
        icon={icon}
        leading={selected?.leading}
        value={selected?.label}
        placeholder={placeholder}
        disabled={disabled}
        onPress={() => setOpen(true)}
      />
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={label}
        closeLabel={t('Đóng')}
        scrollable>
        <View className="gap-1">
          {options.length ? (
            options.map((option) => (
              <BottomSheetOption
                key={option.value}
                label={option.label}
                description={option.description}
                leading={option.leading}
                selected={option.value === value}
                disabled={option.disabled}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              />
            ))
          ) : (
            <Text className="py-4 text-center text-xs text-muted-foreground">{emptyText}</Text>
          )}
        </View>
      </BottomSheet>
    </>
  );
}
