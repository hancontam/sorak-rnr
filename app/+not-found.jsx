import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Không tìm thấy màn hình', headerShown: false }} />
      <SafeAreaView className="flex-1 justify-center bg-background p-4">
        <View className="mx-auto w-full max-w-md gap-4">
          <Text role="heading" className="text-lg font-semibold">
            Không tìm thấy màn hình
          </Text>
          <Text className="text-sm text-muted-foreground">
            Hãy quay lại màn hình đầu để tiếp tục.
          </Text>
          <Link href="/" dismissTo asChild>
            <Button size="sm">
              <Text className="text-xs">Về màn hình đầu</Text>
            </Button>
          </Link>
        </View>
      </SafeAreaView>
    </>
  );
}
