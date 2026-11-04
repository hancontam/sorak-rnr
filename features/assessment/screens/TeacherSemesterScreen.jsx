import { AssessmentScreenHeader } from '@/components/ui/assessment-screen-header';
import {
  AssessmentEmpty,
  AssessmentError,
  AssessmentLoading,
} from '@/components/ui/assessment-state';
import { Input } from '@/components/ui/input';
import { SemesterStudentCard } from '@/components/ui/semester-student-card';
import { SemesterTabSwitch } from '@/components/ui/semester-tab-switch';
import { Text } from '@/components/ui/text';
import { useSemesterAssessment } from '@/features/assessment/hooks/useSemesterAssessment';
import { useClassStudents } from '@/features/assessment/hooks/useClassStudents';
import { formatSemesterPeriod } from '@/features/assessment/lib/assessment-format';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

// Màn hình Đánh giá học kỳ của Giáo viên (Chế độ xem - Read-only view)
// Hiển thị 5 lĩnh vực phát triển theo chuẩn Bộ GD&ĐT của học sinh trong lớp.
export default function TeacherSemesterScreen() {
  const router = useRouter();
  const assignedClass = useAuthStore((state) => state.user?.assignedClasses?.[0]);
  const classId = assignedClass?.classId;
  const [semester, setSemester] = React.useState('SEMESTER_1');
  const [search, setSearch] = React.useState('');

  const query = useSemesterAssessment({ classId, semester });
  const classStudents = useClassStudents(classId);
  const students = query.data?.students || [];

  const avatarByCode = React.useMemo(
    () =>
      (classStudents.data?.students || []).reduce((accumulator, student) => {
        if (student.avatarUrl) accumulator[student.studentCode] = student.avatarUrl;
        return accumulator;
      }, {}),
    [classStudents.data]
  );

  const filtered = students.filter((student) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    return (
      (student.name || '').toLowerCase().includes(keyword) ||
      (student.code || '').toLowerCase().includes(keyword)
    );
  });

  const periodLabel = formatSemesterPeriod(query.data?.classInfo);

  return (
    <View className="flex-1 bg-background">
      <AssessmentScreenHeader
        title="Đánh giá học kỳ"
        subtitle={query.data?.classInfo?.name ? `${query.data.classInfo.name}` : undefined}
        onBack={() => router.back()}
      />

      {query.isPending ? (
        <AssessmentLoading label="Đang tải đánh giá học kỳ…" />
      ) : query.error ? (
        <AssessmentError
          message={
            query.error?.response?.data?.message || query.error?.message || 'Lỗi không xác định.'
          }
          onRetry={() => query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40 }}>
          <SemesterTabSwitch value={semester} onChange={setSemester} />

          {periodLabel ? (
            <Text className="mt-2 text-[11px] text-muted-foreground">{periodLabel}</Text>
          ) : null}

          <View className="mt-3">
            <Input
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm học sinh..."
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Tìm học sinh"
            />
          </View>

          {filtered.length === 0 ? (
            <AssessmentEmpty
              icon={Search}
              title={
                students.length === 0 ? 'Chưa có dữ liệu học kỳ này' : 'Không tìm thấy học sinh'
              }
              description={
                students.length === 0
                  ? 'Chưa có kết quả đánh giá học kỳ của lớp.'
                  : 'Thử từ khoá khác theo tên hoặc mã học sinh.'
              }
            />
          ) : (
            <View className="mt-3 gap-3">
              {filtered.map((student) => (
                <SemesterStudentCard
                  key={student.id}
                  student={student}
                  note={student.teacherNotes ?? ''}
                  avatarUrl={avatarByCode[student.code]}
                  editable={false}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
