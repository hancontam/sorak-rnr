import { Check, ChevronRight, GraduationCap, UsersRound } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { AUTH_ROLES, roleLabel, WEB_ACCOUNT_NOTICE } from '../utils/auth-roles';

// Chọn vai trò đăng nhập trong bottom sheet chung (Gorhom) như các lựa chọn khác của app.
export function RoleSheet({ visible, selectedRole, onClose, onSelect }) {
  const t = useTranslation();
  return (
    <BottomSheet
      open={visible}
      onOpenChange={(open) => !open && onClose()}
      title={t('Chọn vai trò đăng nhập')}
      description={t('Chọn loại tài khoản để tiếp tục.')}
      closeLabel={t('Đóng chọn vai trò')}>
      <View className="gap-2.5">
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
        <Text className="text-2xs leading-4 text-muted-foreground">{t(WEB_ACCOUNT_NOTICE)}</Text>
      </View>
    </BottomSheet>
  );
}

function RoleOption({ role, selected, icon, tag, description, onSelect }) {
  const t = useTranslation();
  const label = t(roleLabel(role));
  return (
    <Pressable
      onPress={() => onSelect(role)}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}. ${tag}. ${description}`}
      // Viền dày cố định 2 dp, chỉ đổi màu viền để khung không nhảy khi chọn.
      className={cn(
        'flex-row items-start gap-3 rounded-2xl border-2 px-3.5 py-3 active:bg-muted/60',
        selected ? 'border-primary bg-muted/50' : 'border-border'
      )}>
      <View
        className={cn(
          'size-9 items-center justify-center rounded-xl',
          selected ? 'bg-primary' : 'bg-muted'
        )}>
        <Icon
          as={icon}
          size={16}
          className={selected ? 'text-primary-foreground' : 'text-foreground'}
        />
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row flex-wrap items-center gap-2">
          <Text className="text-sm font-semibold">{label}</Text>
          <Badge variant="brand">
            <Text>{tag}</Text>
          </Badge>
        </View>
        <Text className="text-xs leading-5 text-muted-foreground">{description}</Text>
      </View>
      <Icon
        as={selected ? Check : ChevronRight}
        size={16}
        className={cn('mt-1', selected ? 'text-foreground' : 'text-muted-foreground')}
      />
    </Pressable>
  );
}
