import { Button } from '@/components/ui/button';
import { StudentReportBody } from '@/components/ui/student-report-body';
import { Text } from '@/components/ui/text';
import { getParentStudentReport } from '@/features/report/api/report.api';
import { getRequestError } from '@/features/report/lib/report-format';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

// Màn hình "Hồ sơ trẻ" của Phụ huynh (Tab 1 Home)
// Kết nối trực tiếp endpoint riêng: GET /parent/student-report
export default function ParentReportScreen() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['parent-student-report'],
    queryFn: getParentStudentReport,
  });

  const studentWithClass = React.useMemo(() => {
    if (!data?.student) return null;
    return {
      ...data.student,
      currentClass: {
        className: data.classInfo?.name,
        schoolYearName: data.classInfo?.schoolYear,
      },
    };
  }, [data]);

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
        <StudentReportBody student={studentWithClass} report={data} bottomInset={120} />
      )}
    </View>
  );
}
