import { Stack } from 'expo-router';

export const unstable_settings = { initialRouteName: '(tabs)' };

export default function TeacherLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center', headerTitleStyle: { fontSize: 16 } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="student/[studentId]" options={{ title: 'Báo cáo học sinh' }} />
    </Stack>
  );
}
