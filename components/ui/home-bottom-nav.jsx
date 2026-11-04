import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { Bell, Inbox, UserRoundCheck } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

function NavAction({ icon, label, count, onPress }) {
  return (
    <View className="relative">
      <Button
        variant="outline"
        onPress={onPress}
        accessibilityLabel={label}
        className="h-10 w-16 rounded-lg border-b-0 px-0 shadow-none">
        <Icon as={icon} size={24} strokeWidth={1} className="text-foreground" />
      </Button>
      {count > 0 ? (
        <Badge className="absolute -right-1 -top-1.5 h-5 min-w-5 border-0 px-1">
          <Text className="text-[11px] font-semibold text-primary-foreground">
            {count > 99 ? '99+' : count}
          </Text>
        </Badge>
      ) : null}
    </View>
  );
}

export function HomeBottomNav({
  isParent,
  className,
  authorizationCount = 0,
  notificationCount = 0,
}) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const footerBottom = Math.max(insets.bottom - 12, 22);
  const fadeHeight = footerBottom + 56;
  const backgroundColor = THEME[colorScheme === 'dark' ? 'dark' : 'light'].background;

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0"
      style={{ height: fadeHeight }}>
      <Svg pointerEvents="none" width="100%" height="100%" style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="home-footer-fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={backgroundColor} stopOpacity="0" />
            <Stop offset="0.45" stopColor={backgroundColor} stopOpacity="0.85" />
            <Stop offset="0.75" stopColor={backgroundColor} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#home-footer-fade)" />
      </Svg>
      <View
        className="absolute left-4 right-4 h-10 flex-row items-center gap-2"
        style={{ bottom: footerBottom }}>
        <NavAction
          icon={isParent ? Inbox : UserRoundCheck}
          label={isParent ? 'Gửi yêu cầu uỷ quyền đón trẻ' : 'Đơn uỷ quyền đón trẻ'}
          count={authorizationCount}
        />
        <View className="h-10 flex-1 items-center justify-center rounded-lg border border-b-0 border-border bg-background">
          <Text className="text-base font-light tracking-tight text-foreground" numberOfLines={1}>
            {className}
          </Text>
        </View>
        <NavAction icon={Bell} label="Thông báo" count={notificationCount} />
      </View>
      <Svg
        pointerEvents="none"
        width="100%"
        height={footerBottom + 16}
        style={{ position: 'absolute', bottom: 0 }}>
        <Defs>
          <LinearGradient id="home-footer-edge-fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={backgroundColor} stopOpacity="0" />
            <Stop offset="0.42" stopColor={backgroundColor} stopOpacity="0.7" />
            <Stop offset="1" stopColor={backgroundColor} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#home-footer-edge-fade)" />
      </Svg>
    </View>
  );
}
