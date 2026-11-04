import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Bell, Inbox, UserRoundCheck } from 'lucide-react-native';
import { View } from 'react-native';

function NavAction({ icon, label, count, onPress }) {
  return (
    <View className="relative">
      <Button
        variant="outline"
        onPress={onPress}
        accessibilityLabel={label}
        className="h-10 w-16 rounded-lg px-0">
        <Icon as={icon} size={24} strokeWidth={2} className="text-foreground" />
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
  return (
    <View className="flex-row items-center gap-2 bg-background px-4 pt-3">
      <NavAction
        icon={isParent ? Inbox : UserRoundCheck}
        label={isParent ? 'Gửi yêu cầu uỷ quyền đón trẻ' : 'Đơn uỷ quyền đón trẻ'}
        count={authorizationCount}
      />
      <View className="h-10 flex-1 items-center justify-center rounded-lg border border-border bg-background">
        <Text className="text-base font-light tracking-tight text-foreground" numberOfLines={1}>
          {className}
        </Text>
      </View>
      <NavAction icon={Bell} label="Thông báo" count={notificationCount} />
    </View>
  );
}
