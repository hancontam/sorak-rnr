import { Stack } from 'expo-router';

import { useTranslation } from '@/shared/i18n/useLanguage';

export const unstable_settings = { initialRouteName: '(tabs)' };

export default function TeacherLayout() {
  const t = useTranslation();
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center', headerTitleStyle: { fontSize: 16 } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="student/[studentId]" options={{ title: t('Báo cáo học sinh') }} />
      <Stack.Screen name="schedule-activity" options={{ title: t('Hoạt động trong ngày') }} />
      <Stack.Screen name="daily-records" options={{ title: t('Ghi nhận trong ngày') }} />
      <Stack.Screen name="pickup-requests" options={{ title: t('Đơn ủy quyền đón trẻ') }} />
      <Stack.Screen name="learning-results/[kind]" options={{ title: t('Kết quả học tập') }} />
      <Stack.Screen name="notifications" options={{ title: t('Thông báo') }} />
    </Stack>
  );
}
