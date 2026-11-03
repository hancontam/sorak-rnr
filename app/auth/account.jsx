import AccountScreen from '@/features/auth/screens/AccountScreen';
import { Stack } from 'expo-router';

export default function AccountRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: 'slide_from_right' }} />
      <AccountScreen />
    </>
  );
}
