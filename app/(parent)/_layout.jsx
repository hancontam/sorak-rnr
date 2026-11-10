import { Stack } from 'expo-router';

export default function ParentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="learning-results/[kind]"
        options={{ headerShown: true, title: 'Kết quả học tập', headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="notifications"
        options={{ headerShown: true, title: 'Thông báo', headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="pickup-requests"
        options={{ headerShown: true, title: 'Đơn ủy quyền đón trẻ', headerTitleAlign: 'center' }}
      />
      <Stack.Screen
        name="schedule-activity"
        options={{
          headerShown: true,
          title: 'Hoạt động của con',
          headerTitleAlign: 'center',
          headerTitleStyle: { fontSize: 16 },
        }}
      />
    </Stack>
  );
}
