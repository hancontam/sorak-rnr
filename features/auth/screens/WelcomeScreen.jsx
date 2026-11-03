import {
  Button,
  RoleSelectionSheet,
  SorakBrand,
  Text,
  TypewriterText,
  WelcomeCarousel,
} from '@/components/ui';
import { useIsFocused, useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const welcomeLines = [
  'Mỗi ngày đến lớp,\nmột điều tuyệt vời.',
  'Mỗi nụ cười nhỏ,\nmột niềm vui lớn.',
  'Cùng con khôn lớn,\nqua từng ngày vui.',
];

export default function WelcomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [isRoleSheetOpen, setIsRoleSheetOpen] = React.useState(false);
  const navigationTimer = React.useRef(null);

  React.useEffect(() => () => clearTimeout(navigationTimer.current), []);

  function selectRole(role) {
    if (navigationTimer.current) return;
    setIsRoleSheetOpen(false);
    navigationTimer.current = setTimeout(() => {
      navigationTimer.current = null;
      router.push({ pathname: '/auth/account', params: { role } });
    }, 180);
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 justify-between pb-[35px] pt-6">
        <View className="items-center gap-8 px-6">
          <SorakBrand />
          <TypewriterText
            lines={welcomeLines}
            className="text-center text-[30px] leading-10 text-foreground"
            style={{ fontFamily: 'JetBrainsMono_400Regular', letterSpacing: -0.8, minHeight: 80 }}
          />
        </View>
        <WelcomeCarousel active={isFocused} />
        <View className="px-6">
          <Button size="lg" className="w-full" onPress={() => setIsRoleSheetOpen(true)}>
            <Text>Tiếp tục</Text>
          </Button>
        </View>
      </View>
      <RoleSelectionSheet
        open={isRoleSheetOpen}
        onOpenChange={setIsRoleSheetOpen}
        onSelectRole={selectRole}
      />
    </SafeAreaView>
  );
}
