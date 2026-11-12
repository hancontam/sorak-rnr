import { Check, ChevronRight, GraduationCap, UsersRound, X } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { AUTH_ROLES, roleLabel, WEB_ACCOUNT_NOTICE } from '../utils/auth-roles';

export function RoleSheet({ visible, selectedRole, onClose, onSelect }) {
  const t = useTranslation();
  return (
    <Modal
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      visible={visible}
      onRequestClose={onClose}
      animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <Pressable
          className="absolute inset-0"
          accessible={false}
          importantForAccessibility="no"
          onPress={onClose}
        />
        <SafeAreaView
          edges={['bottom']}
          className="mx-auto max-h-[88%] w-full max-w-lg rounded-t-[28px] border-t border-border bg-background">
          <ScrollView bounces={false} contentContainerClassName="gap-2.5 px-5 pb-4 pt-4">
            <View className="mb-1.5 h-1.5 w-10 self-center rounded-full bg-muted-foreground/35" />
            <View className="flex-row items-center justify-between gap-2">
              <View className="flex-1 gap-0.5">
                <Text className="text-sm font-semibold leading-5">
                  {t('Chọn vai trò đăng nhập')}
                </Text>
                <Text className="text-xs leading-4 text-muted-foreground">
                  {t('Chọn loại tài khoản để tiếp tục.')}
                </Text>
              </View>
              <Button
                variant="secondary"
                size="icon"
                className="size-7 rounded-full"
                hitSlop={8}
                onPress={onClose}
                accessibilityLabel={t('Đóng chọn vai trò')}>
                <Icon as={X} size={16} className="text-muted-foreground" />
              </Button>
            </View>
            <RoleOption
              role={AUTH_ROLES.teacher}
              selected={selectedRole === AUTH_ROLES.teacher}
              icon={GraduationCap}
              tag={t('Mã cán bộ')}
              description={t('Điểm danh lớp học và cập nhật nhật ký ngày cho phụ huynh.')}
              onSelect={onSelect}
            />
            <RoleOption
              role={AUTH_ROLES.parent}
              selected={selectedRole === AUTH_ROLES.parent}
              icon={UsersRound}
              tag={t('Mã học sinh')}
              description={t('Xem hoạt động, hồ sơ và kết quả đánh giá của con.')}
              onSelect={onSelect}
            />
            <Text className="text-[10px] leading-[14px] text-muted-foreground">
              {t(WEB_ACCOUNT_NOTICE)}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function RoleOption({ role, selected, icon, tag, description, onSelect }) {
  const t = useTranslation();
  const label = t(roleLabel(role));
  return (
    <Button
      variant="outline"
      className={`h-auto items-start justify-start gap-3 rounded-2xl px-3.5 py-3 ${selected ? 'border-2 border-primary bg-muted/50' : 'border border-border'}`}
      onPress={() => onSelect(role)}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}. ${tag}. ${description}`}>
      <View
        className={`mt-0.5 size-9 items-center justify-center rounded-xl ${selected ? 'bg-primary' : 'bg-muted'}`}>
        <Icon
          as={icon}
          size={16}
          className={selected ? 'text-primary-foreground' : 'text-foreground'}
        />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <View className="flex-row flex-wrap items-center gap-2">
          <Text className="text-xs font-semibold leading-4">{label}</Text>
          <Badge variant="brand">
            <Text className="text-[11px] font-semibold leading-[14px]">{tag}</Text>
          </Badge>
        </View>
        <Text className="text-[11px] leading-[14px] text-muted-foreground">{description}</Text>
      </View>
      <Icon
        as={selected ? Check : ChevronRight}
        size={16}
        className={selected ? 'mt-1 text-foreground' : 'mt-1 text-muted-foreground'}
      />
    </Button>
  );
}
