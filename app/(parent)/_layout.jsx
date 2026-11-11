import { Stack } from 'expo-router';

import { useTranslation } from '@/shared/i18n/useLanguage';

export const unstable_settings = { initialRouteName: '(tabs)' };

export default function ParentLayout() {
  const t = useTranslation();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="activity-journal"
        options={{
          headerShown: true,
          title: t('Nhật ký hoạt động ở trường'),
          headerTitleAlign: 'center',
          headerTitleStyle: { fontSize: 16 },
        }}
      />
      <Stack.Screen
        name="learning-results/[kind]"
        options={{ headerShown: true, title: t('Kết quả học tập'), headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="notifications"
        options={{ headerShown: true, title: t('Thông báo'), headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="pickup-requests"
        options={{
          headerShown: true,
          title: t('Đơn ủy quyền đón trẻ'),
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="schedule-activity"
        options={{
          headerShown: true,
          title: t('Hoạt động của con'),
          headerTitleAlign: 'center',
          headerTitleStyle: { fontSize: 16 },
        }}
      />
    </Stack>
  );
}
