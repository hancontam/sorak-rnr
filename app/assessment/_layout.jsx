import { useAuthStore } from '@/features/auth/store/auth.store';
import { Stack } from 'expo-router';

export default function AssessmentLayout() {
  const role = useAuthStore((state) => state.user?.role);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={role === 'TEACHER_GV'}>
        <Stack.Screen name="teacher-good-child" />
        <Stack.Screen name="teacher-semester" />
      </Stack.Protected>
      <Stack.Protected guard={role === 'PARENT_PH'}>
        <Stack.Screen name="parent-contact-book" />
        <Stack.Screen name="parent-semester" />
      </Stack.Protected>
    </Stack>
  );
}
