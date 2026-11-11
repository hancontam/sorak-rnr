import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

export function OtpCodeInput({ otp, onChange, onSubmit, pending, typography }) {
  const t = useTranslation();
  const [focused, setFocused] = useState(false);
  return (
    <View className="relative">
      <View className="flex-row gap-2" importantForAccessibility="no-hide-descendants" aria-hidden>
        {Array.from({ length: 6 }, (_, index) => (
          <View
            key={index}
            className={`min-h-11 flex-1 items-center justify-center rounded-lg border py-1 ${focused && index === Math.min(otp.length, 5) ? 'border-primary' : 'border-input'}`}>
            <Text className="text-sm leading-5" style={typography.monoSemiBold}>
              {otp[index] || ''}
            </Text>
          </View>
        ))}
      </View>
      <TextInput
        className="absolute inset-0 h-full w-full opacity-0"
        accessibilityLabel={t('Mã xác thực, 6 chữ số')}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        caretHidden
        value={otp}
        onChangeText={(value) => onChange(value.replace(/\D/g, '').slice(0, 6))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={!pending}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
    </View>
  );
}
