import { Button } from '@/components/ui/button';
import { StudentReportBody } from '@/components/ui/student-report-body';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useStudentReport } from '@/features/report/hooks/useStudentReport';
import { getRequestError } from '@/features/report/lib/report-format';
import { ActivityIndicator, View } from 'react-native';

export default function ParentReportScreen() {
  const child = useAuthStore((state) => state.user?.student);
  const { student, report, isLoading, error, refetch } = useStudentReport(
    child?.classId,
    child?.id
  );

  if (!child?.id || !child?.classId) {
    return (
      <Text className="text-sm text-muted-foreground">
        Tài khoản chưa liên kết với học sinh hoặc lớp.
      </Text>
    );
  }

  return (
    <View className="flex-1" style={{ marginHorizontal: -24 }}>
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
        <StudentReportBody student={student} report={report} bottomInset={120} />
      )}
    </View>
  );
}
