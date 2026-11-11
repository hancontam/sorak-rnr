import { useRouter } from 'expo-router';
import { BookOpen, ChevronRight, GraduationCap } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { TeacherWebsiteNotice } from '../components/TeacherWebsiteNotice';

const SECTIONS = [
  {
    kind: 'monthly',
    title: 'Sổ bé ngoan',
    icon: BookOpen,
    detail: 'Kết quả từng tuần và tổng kết tháng',
  },
  {
    kind: 'semester',
    title: 'Kết quả học kỳ',
    icon: GraduationCap,
    detail: 'Các lĩnh vực phát triển và nhận xét',
  },
];

export default function LearningResultsHome() {
  const router = useRouter();
  const parent = useAuthStore((state) => state.user?.role === AUTH_ROLES.parent);
  const t = useTranslation();
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="mx-auto w-full max-w-xl gap-4 p-4">
      <View className="gap-1">
        <Text className="text-lg font-semibold">{t('Kết quả học tập')}</Text>
        <Text className="text-xs text-muted-foreground">
          {t(parent ? 'Theo dõi kết quả của con' : 'Xem kết quả của lớp được phân công')}
        </Text>
      </View>
      {!parent ? <TeacherWebsiteNotice /> : null}
      {SECTIONS.map(({ kind, title, icon, detail }) => (
        <Pressable
          key={kind}
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: parent
                ? '/(parent)/learning-results/[kind]'
                : '/(teacher)/learning-results/[kind]',
              params: { kind },
            })
          }
          className="active:opacity-80">
          <Card className="flex-row items-center gap-3 p-4 shadow-none">
            <View className="rounded-lg bg-muted p-2.5">
              <Icon as={icon} size={19} />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-sm font-semibold">{t(title)}</Text>
              <Text className="text-xs text-muted-foreground">{t(detail)}</Text>
            </View>
            <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}
