import { Check, GraduationCap, UsersRound } from 'lucide-react-native';
import { View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { AUTH_ROLES, WEB_ACCOUNT_NOTICE } from '../utils/auth-roles';

// Chọn loại tài khoản như Figma (Welcome/login flow): hai nút "Tiếp tục với tài khoản …" và dòng
// điều khoản. Vai trò đang chọn (khi mở lại từ màn đăng nhập) có dấu tích.
export function RoleSheet({ visible, selectedRole, onClose, onSelect }) {
  const t = useTranslation();
  return (
    <BottomSheet
      open={visible}
      onOpenChange={(open) => !open && onClose()}
      title={t('Chọn loại tài khoản')}
      // Ghi chú BGH đặt ngay dưới tiêu đề; cuối sheet chỉ còn dòng điều khoản.
      description={t(WEB_ACCOUNT_NOTICE)}
      closeLabel={t('Đóng chọn vai trò')}>
      <View className="gap-2.5">
        <RoleButton
          label={t('Tiếp tục với tài khoản Phụ huynh')}
          icon={UsersRound}
          selected={selectedRole === AUTH_ROLES.parent}
          onPress={() => onSelect(AUTH_ROLES.parent)}
        />
        <RoleButton
          label={t('Tiếp tục với tài khoản Nhà trường')}
          icon={GraduationCap}
          selected={selectedRole === AUTH_ROLES.teacher}
          onPress={() => onSelect(AUTH_ROLES.teacher)}
        />
        <Text className="pt-1 text-center text-2xs leading-4 text-muted-foreground">
          {t(
            'Bằng việc tiếp tục, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của Sorak.'
          )}
        </Text>
      </View>
    </BottomSheet>
  );
}

function RoleButton({ label, icon, selected, onPress }) {
  return (
    <Button
      variant="outline"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      className="h-12 justify-start gap-3 px-4">
      <Icon as={icon} size={18} className="text-primary" />
      <Text className="min-w-0 flex-1 text-sm font-semibold">{label}</Text>
      {selected ? <Icon as={Check} size={16} className="text-primary" /> : null}
    </Button>
  );
}
