import { useRouter } from 'expo-router';
import { BookOpen, ChevronRight, GraduationCap } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';

import { HeroCard } from '@/components/shared/HeroCard';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { TeacherWebsiteNotice } from '../components/TeacherWebsiteNotice';

const RESULTS_HERO = require('@/assets/images/hero-results.jpg');

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
      <Text className="text-lg font-semibold tracking-tight">{t('Kết quả học tập')}</Text>
      <HeroCard
        source={RESULTS_HERO}
        tag={`${t('Sổ bé ngoan')} · ${t('Kết quả học kỳ')}`}
        title={t(parent ? 'Theo dõi kết quả của con' : 'Xem kết quả của lớp được phân công')}
      />
      {!parent ? <TeacherWebsiteNotice /> : null}
      <Card className="gap-0 overflow-hidden py-0">
        {SECTIONS.map(({ kind, title, icon, detail }, index) => (
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
            className={cn(
              'min-h-16 flex-row items-center gap-3 px-4 py-3 active:bg-muted/60',
              index > 0 && 'border-t border-border'
            )}>
            <View className="size-9 items-center justify-center rounded-lg bg-muted">
              <Icon as={icon} size={18} />
            </View>
            <View className="min-w-0 flex-1 gap-0.5">
              <Text className="text-sm font-semibold">{t(title)}</Text>
              <Text className="text-2xs text-muted-foreground">{t(detail)}</Text>
            </View>
            <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
          </Pressable>
        ))}
      </Card>
    </ScrollView>
  );
}
