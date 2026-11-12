import { OTPInput } from 'input-otp-native';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

const LENGTH = 6;

// Ô OTP 6 số kiểu Stripe (3 – 3): dùng chung cho đăng nhập 2FA, quên mật khẩu và bật 2FA.
export function OtpCodeInput({ otp, onChange, onSubmit, pending, autoFocus = false }) {
  const t = useTranslation();
  return (
    <OTPInput
      value={otp}
      onChange={(value) => onChange(value.replace(/\D/g, '').slice(0, LENGTH))}
      onComplete={(value) => onSubmit?.(value)}
      maxLength={LENGTH}
      pattern="^\d+$"
      editable={!pending}
      autoFocus={autoFocus}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      autoComplete="sms-otp"
      returnKeyType="done"
      onSubmitEditing={() => onSubmit?.()}
      accessibilityLabel={t('Mã xác thực, 6 chữ số')}
      pasteTransformer={(pasted) => pasted.replace(/\D/g, '')}
      render={({ slots }) => (
        <View
          className={cn('flex-row items-center justify-center', pending && 'opacity-60')}
          importantForAccessibility="no-hide-descendants"
          aria-hidden>
          <SlotGroup slots={slots.slice(0, 3)} />
          <View className="mx-2 h-0.5 w-3 rounded-full bg-border" />
          <SlotGroup slots={slots.slice(3)} />
        </View>
      )}
    />
  );
}

function SlotGroup({ slots }) {
  return (
    <View className="flex-row">
      {slots.map((slot, index) => (
        <View
          key={index}
          className={cn(
            'h-12 w-11 items-center justify-center border-y border-r border-input bg-background dark:bg-input/30',
            index === 0 && 'rounded-l-lg border-l',
            index === slots.length - 1 && 'rounded-r-lg',
            slot.isActive && 'z-10 border border-foreground'
          )}>
          {slot.char ? (
            <Text className="font-mono text-lg font-semibold">{slot.char}</Text>
          ) : slot.isActive ? (
            <View className="h-5 w-px bg-foreground" />
          ) : null}
        </View>
      ))}
    </View>
  );
}
