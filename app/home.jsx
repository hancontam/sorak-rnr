import HomeScreen from '@/features/home/screens/HomeScreen';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function HomeRoute() {
  const user = useAuthStore((state) => state.user);
  const isRestoring = useAuthStore((state) => state.isRestoring);
  if (isRestoring)
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  if (!user) return <Redirect href="/" />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <HomeScreen />
    </>
  );
}
