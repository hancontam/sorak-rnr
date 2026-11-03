import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, TextInput, View } from 'react-native';

export function OtpCodeInput({ value, onChange }) {
  const input = React.useRef(null);

  return (
    <Pressable
      className="relative flex-row items-center justify-center gap-2"
      onPress={() => input.current?.focus()}
      accessibilityRole="button"
      accessibilityLabel="Nhập mã OTP gồm 6 chữ số">
      {Array.from({ length: 6 }, (_, index) => (
        <React.Fragment key={index}>
          {index === 3 ? <View className="h-px w-7 bg-foreground" /> : null}
          <View
            className={`h-11 flex-1 items-center justify-center rounded-md border bg-background ${
              index === value.length ? 'border-[#8ec5ff]' : 'border-border'
            }`}>
            <Text className="text-base">{value[index] || ''}</Text>
          </View>
        </React.Fragment>
      ))}
      <TextInput
        ref={input}
        className="absolute inset-0 opacity-0"
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={6}
        caretHidden
        accessibilityLabel="Mã OTP"
      />
    </Pressable>
  );
}
