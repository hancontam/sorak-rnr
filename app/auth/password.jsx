import PasswordScreen from '@/features/auth/screens/PasswordScreen';
import { Stack } from 'expo-router';

export default function PasswordRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: 'slide_from_right' }} />
      <PasswordScreen />
    </>
  );
}
