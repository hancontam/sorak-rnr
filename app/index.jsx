import WelcomeScreen from '@/features/auth/screens/WelcomeScreen';
import { Stack } from 'expo-router';

export default function IndexRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WelcomeScreen />
    </>
  );
}
