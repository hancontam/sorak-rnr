import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Image, Pressable, ScrollView, View } from 'react-native';

import { IllustrationCard } from '@/components/shared/IllustrationCard';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { useTranslation } from '@/shared/i18n/useLanguage';

const RESULTS_ART = require('@/assets/images/illustration-results.webp');
const ROSE = require('@/assets/images/rose.webp');
const LOTUS = require('@/assets/images/lotus.webp');
const MEDAL = require('@/assets/images/semester-medal.webp');
const ART = { width: 52, height: 52 };

// Hai lối vào dạng ô lớn, cùng kiểu hình 3D (hoa hồng + hoa sen cho Sổ bé ngoan, giấy khen + huy chương
// cho học kỳ) để tab Kết quả học tập bớt đơn điệu. Ghi chú làm trên website nằm trong từng màn.
function SectionTile({ title, detail, art, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${detail}`}
      onPress={onPress}
      className="min-w-0 flex-1 justify-between gap-3 border border-border bg-card p-3.5 active:bg-muted">
      <View className="h-14 flex-row items-end">{art}</View>
      <View className="gap-0.5">
        <View className="flex-row items-center justify-between gap-1">
          <Text className="text-sm font-semibold">{title}</Text>
          <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
        </View>
        <Text numberOfLines={2} className="text-2xs leading-4 text-muted-foreground">
          {detail}
        </Text>
      </View>
    </Pressable>
  );
}

export default function LearningResultsHome() {
  const router = useRouter();
  const parent = useAuthStore((state) => state.user?.role === AUTH_ROLES.parent);
  const t = useTranslation();
  const open = (kind) =>
    router.push({
      pathname: parent ? '/(parent)/learning-results/[kind]' : '/(teacher)/learning-results/[kind]',
      params: { kind },
    });
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="mx-auto w-full max-w-xl gap-4 p-4">
      <Text className="text-lg font-semibold tracking-tight">{t('Kết quả học tập')}</Text>
      <IllustrationCard
        source={RESULTS_ART}
        eyebrow={`${t('Sổ bé ngoan')} · ${t('Học kỳ')}`}
        title={t(parent ? 'Theo dõi kết quả của con' : 'Xem kết quả của lớp được phân công')}
      />
      <View className="flex-row gap-3">
        <SectionTile
          title={t('Sổ bé ngoan')}
          detail={t('Kết quả từng tuần và tổng kết tháng')}
          onPress={() => open('monthly')}
          art={
            <>
              <Image source={LOTUS} style={ART} resizeMode="contain" />
              <Image
                source={ROSE}
                style={{ width: 30, height: 30, marginLeft: -14 }}
                resizeMode="contain"
              />
            </>
          }
        />
        <SectionTile
          title={t('Kết quả học kỳ')}
          detail={t('Các lĩnh vực phát triển và nhận xét')}
          onPress={() => open('semester')}
          art={<Image source={MEDAL} style={ART} resizeMode="contain" />}
        />
      </View>
    </ScrollView>
  );
}
