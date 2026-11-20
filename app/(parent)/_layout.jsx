import { Stack } from 'expo-router';

import { APP_HEADER } from '@/components/shared/AppHeader';
import { useTranslation } from '@/shared/i18n/useLanguage';

export const unstable_settings = { initialRouteName: '(tabs)' };

export default function ParentLayout() {
  const t = useTranslation();
  return (
    <Stack screenOptions={{ ...APP_HEADER, headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="activity-journal"
        options={{
          headerShown: true,
          title: t('Nhật ký hoạt động ở trường'),
        }}
      />
      <Stack.Screen
        name="learning-results/[kind]"
        options={{ headerShown: true, title: t('Kết quả học tập') }}
      />
      <Stack.Screen name="notifications" options={{ headerShown: true, title: t('Thông báo') }} />
      <Stack.Screen
        name="pickup-requests"
        options={{
          headerShown: true,
          title: t('Ủy quyền đón con'),
        }}
      />
      <Stack.Screen
        name="schedule-activity"
        options={{
          headerShown: true,
          title: t('Hoạt động của con'),
        }}
      />
    </Stack>
  );
}
