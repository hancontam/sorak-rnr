import { OTPInput } from 'input-otp-native';
import { StyleSheet, View } from 'react-native';

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
      // Ô nhập ẩn của thư viện vẫn chiếm chỗ trên Android (khung cao 88 thay vì 48 dp),
      // tạo khoảng trống dưới các ô; đặt lại tuyệt đối phủ đúng hàng ô.
      style={styles.hiddenInput}
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
      {slots.map((slot, index) => {
        const first = index === 0;
        const last = index === slots.length - 1;
        return (
          // Class của ô cố định theo vị trí; không thêm class khi ô được chọn vì NativeWind
          // áp sai style lúc đổi trạng thái (ô đầu mất viền/nền). Ô chọn dùng lớp phủ con.
          <View
            key={index}
            className={cn(
              'h-12 w-11 items-center justify-center border-y border-r border-input bg-background dark:bg-input/30',
              first && 'rounded-l-lg border-l',
              last && 'rounded-r-lg'
            )}>
            {slot.isActive ? (
              <View
                pointerEvents="none"
                className={cn(
                  'absolute inset-0 border-2 border-foreground',
                  first && 'rounded-l-lg',
                  last && 'rounded-r-lg'
                )}
              />
            ) : null}
            {slot.char ? (
              <Text className="font-mono text-lg font-semibold">{slot.char}</Text>
            ) : slot.isActive ? (
              <View className="h-5 w-px bg-foreground" />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenInput: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0 },
});
