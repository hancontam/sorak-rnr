import { Stack } from 'expo-router';

export default function ParentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
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
