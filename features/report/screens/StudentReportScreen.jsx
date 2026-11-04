import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { StudentReportBody } from '@/components/ui/student-report-body';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useStudentReport } from '@/features/report/hooks/useStudentReport';
import { getRequestError } from '@/features/report/lib/report-format';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StudentReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const user = useAuthStore((state) => state.user);
  const studentId = Array.isArray(params.studentId) ? params.studentId[0] : params.studentId;
  const routeClassId = Array.isArray(params.classId) ? params.classId[0] : params.classId;
  const classId = routeClassId || user?.student?.classId || user?.assignedClasses?.[0]?.classId;
  const { student, report, isLoading, error, refetch } = useStudentReport(classId, studentId);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="mx-6 h-14 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Quay lại danh sách học sinh"
          className="size-8 items-center justify-center">
          <Icon as={ChevronLeft} size={20} strokeWidth={2} className="text-foreground" />
        </Pressable>
        <Text className="text-lg font-semibold">Báo cáo học sinh</Text>
      </View>
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-center text-sm text-destructive">{getRequestError(error)}</Text>
          <Button variant="outline" onPress={refetch}>
            <Text>Thử lại</Text>
          </Button>
        </View>
      ) : (
        <StudentReportBody student={student} report={report} />
      )}
    </SafeAreaView>
  );
}
