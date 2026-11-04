import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StudentListCard } from '@/components/ui/student-list-card';
import { Text } from '@/components/ui/text';
import { getClassStudents } from '@/features/report/api/report.api';
import { getRequestError } from '@/features/report/lib/report-format';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  RefreshControl,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReportListScreen({ classId }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [iosKeyboardHeight, setIosKeyboardHeight] = useState(0);
  useEffect(() => {
    if (Platform.OS !== 'ios') return undefined;
    const show = Keyboard.addListener('keyboardWillShow', (event) => {
      setIosKeyboardHeight(event.endCoordinates?.height || 0);
    });
    const hide = Keyboard.addListener('keyboardWillHide', () => setIosKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  const { data, isPending, isRefetching, error, refetch } = useQuery({
    queryKey: ['class-students', classId],
    queryFn: () => getClassStudents(classId),
    enabled: Boolean(classId),
  });
  const students = data?.students || [];
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('vi');
    if (!term) return students;
    return students.filter((student) =>
      `${student.fullName || ''} ${student.studentCode || ''}`
        .toLocaleLowerCase('vi')
        .includes(term)
    );
  }, [search, students]);
  const searchBottom = iosKeyboardHeight
    ? iosKeyboardHeight + 16
    : Math.max(insets.bottom - 12, 22) + 56;

  return (
    <View className="flex-1">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg font-semibold">Danh sách học sinh</Text>
        <Badge variant="secondary" className="rounded-md px-2">
          <Text className="text-xs">{students.length} học sinh</Text>
        </Badge>
      </View>
      {!classId ? (
        <Text className="text-sm text-muted-foreground">Tài khoản chưa được phân công lớp.</Text>
      ) : isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : error ? (
        <Text className="text-sm text-destructive">{getRequestError(error)}</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(student) => String(student.id)}
          renderItem={({ item }) => (
            <StudentListCard
              student={item}
              onPress={() =>
                router.push({
                  pathname: '/report/[studentId]',
                  params: { studentId: item.id, classId },
                })
              }
            />
          )}
          ItemSeparatorComponent={() => <View className="h-2" />}
          contentContainerStyle={{ paddingBottom: searchBottom + 66 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <Text className="py-8 text-center text-sm text-muted-foreground">
              {search ? 'Không tìm thấy học sinh.' : 'Lớp chưa có học sinh.'}
            </Text>
          }
        />
      )}
      <View
        className="absolute left-0 right-0 rounded-lg border border-border bg-background p-0.5 shadow-sm shadow-black/5"
        style={{ bottom: searchBottom }}>
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm học sinh..."
          accessibilityLabel="Tìm học sinh theo tên hoặc mã"
          autoCorrect={false}
          className="h-11 border-0 bg-background shadow-none"
        />
      </View>
    </View>
  );
}
