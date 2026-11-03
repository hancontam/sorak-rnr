import { AuthScreenHeader, Button, Input, Text } from '@/components/ui';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { role } = useLocalSearchParams();
  const isParent = role === 'PARENT_PH';
  const usernameInputRef = React.useRef(null);
  const [username, setUsername] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', (event) => {
      if (!event.data?.closing) usernameInputRef.current?.focus();
    });
    return unsubscribe;
  }, [navigation]);

  function continueToPassword() {
    const value = username.trim();
    if (!value) {
      setError(isParent ? 'Vui lòng nhập mã học sinh.' : 'Vui lòng nhập tài khoản.');
      return;
    }
    setError('');
    router.push({ pathname: '/auth/password', params: { role, username: value } });
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AuthScreenHeader
          title={isParent ? 'Phụ huynh' : 'Giáo viên'}
          onBack={() => router.back()}
        />
        <View className="gap-5 px-6 pt-6">
          <Text className="text-sm">
            {isParent ? 'Nhập mã học sinh của con' : 'Nhập tài khoản được cấp'}
          </Text>
          <View className="gap-3">
            <View className="gap-2">
              <Text className="text-[11px] font-medium">
                {isParent ? 'Mã học sinh' : 'Tài khoản'}
              </Text>
              <Input
                ref={usernameInputRef}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                value={username}
                onChangeText={(value) => {
                  setUsername(value);
                  if (error) setError('');
                }}
                onSubmitEditing={continueToPassword}
                returnKeyType="next"
                accessibilityLabel={isParent ? 'Mã học sinh' : 'Tài khoản'}
              />
              {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
            </View>
            <Button
              className="w-full bg-[#8ec5ff] active:bg-[#8ec5ff]/90"
              onPress={continueToPassword}>
              <Text className="text-foreground">Tiếp tục</Text>
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
