import { Stack } from 'expo-router';

export const unstable_settings = { initialRouteName: '(tabs)' };

export default function TeacherLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center', headerTitleStyle: { fontSize: 16 } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="student/[studentId]" options={{ title: 'Báo cáo học sinh' }} />
      <Stack.Screen name="schedule-activity" options={{ title: 'Hoạt động trong ngày' }} />
      <Stack.Screen name="daily-records" options={{ title: 'Ghi nhận trong ngày' }} />
      <Stack.Screen name="pickup-requests" options={{ title: 'Đơn ủy quyền đón trẻ' }} />
      <Stack.Screen name="learning-results/[kind]" options={{ title: 'Kết quả học tập' }} />
      <Stack.Screen name="notifications" options={{ title: 'Thông báo' }} />
    </Stack>
  );
}
