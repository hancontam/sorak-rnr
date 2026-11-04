import { Badge } from '@/components/ui/badge';
import { StudentListCard } from '@/components/ui/student-list-card';
import { Text } from '@/components/ui/text';
import { getClassStudents } from '@/features/report/api/report.api';
import { getRequestError } from '@/features/report/lib/report-format';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReportListScreen({ classId, search }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  const footerSpace = Math.max(insets.bottom - 12, 22) + 120;

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
          contentContainerStyle={{ paddingBottom: footerSpace }}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <Text className="py-8 text-center text-sm text-muted-foreground">
              {search ? 'Không tìm thấy học sinh.' : 'Lớp chưa có học sinh.'}
            </Text>
          }
        />
      )}
    </View>
  );
}
