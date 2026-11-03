import { SettingsMenuRow, SettingsSheetLayout, Text } from '@/components/ui';
import { BookOpen, FileText, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function AboutScreen() {
  const router = useRouter();
  return (
    <SettingsSheetLayout title="Giới thiệu" onBack={() => router.back()}>
      <View className="mb-4 h-10 flex-row items-center justify-between">
        <Text className="text-sm font-medium">Phiên bản</Text>
        <Text className="text-sm text-muted-foreground">v1.0.0</Text>
      </View>
      <View className="gap-3 border-t border-border pt-3">
        <Text className="text-xs font-semibold text-muted-foreground">PHÁP LÝ</Text>
        <SettingsMenuRow label="Chính sách bảo mật" icon={Shield} />
        <SettingsMenuRow label="Điều khoản sử dụng" icon={FileText} />
        <Text className="pt-2 text-xs font-semibold text-muted-foreground">TÀI LIỆU</Text>
        <SettingsMenuRow label="Tài liệu hướng dẫn Sorak" icon={BookOpen} />
      </View>
    </SettingsSheetLayout>
  );
}
