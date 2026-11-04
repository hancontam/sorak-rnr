import { AssessmentScreenHeader } from '@/components/ui/assessment-screen-header';
import {
  AssessmentEmpty,
  AssessmentError,
  AssessmentLoading,
} from '@/components/ui/assessment-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SemesterStudentCard } from '@/components/ui/semester-student-card';
import { SemesterTabSwitch } from '@/components/ui/semester-tab-switch';
import { Text } from '@/components/ui/text';
import { ThemedSpinner } from '@/components/ui/themed-spinner';
import { useSemesterAssessment } from '@/features/assessment/hooks/useSemesterAssessment';
import { useSaveSemesterNotes } from '@/features/assessment/hooks/useParentResults';
import { formatSemesterPeriod } from '@/features/assessment/lib/assessment-format';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import * as React from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function buildInitialNotes(students) {
  return (students || []).reduce((accumulator, student) => {
    accumulator[student.id] = student.teacherNotes || '';
    return accumulator;
  }, {});
}

export default function TeacherSemesterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const assignedClass = useAuthStore((state) => state.user?.assignedClasses?.[0]);
  const classId = assignedClass?.classId;
  const [semester, setSemester] = React.useState('SEMESTER_1');
  const [search, setSearch] = React.useState('');
  const [notes, setNotes] = React.useState({});

  const query = useSemesterAssessment({ classId, semester });
  const saveNotes = useSaveSemesterNotes();
  const students = query.data?.students || [];

  // Nạp lại lời bình mỗi khi dữ liệu của học kỳ đang chọn thay đổi.
  React.useEffect(() => {
    if (query.data) setNotes(buildInitialNotes(query.data.students));
  }, [query.data]);

  const filtered = students.filter((student) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    return (
      (student.name || '').toLowerCase().includes(keyword) ||
      (student.code || '').toLowerCase().includes(keyword)
    );
  });

  async function submitNotes() {
    const records = students
      .map((student) => ({ studentId: student.id, teacherNotes: notes[student.id] ?? '' }))
      .filter((record) => record.teacherNotes !== '');
    if (records.length === 0) {
      Alert.alert('Chưa có lời bình', 'Nhập lời bình cho ít nhất một học sinh trước khi lưu.');
      return;
    }
    try {
      await saveNotes.mutateAsync({ classId, semester, records });
      Alert.alert('Đã lưu', 'Lời bình đánh giá học kỳ đã được lưu.');
    } catch (error) {
      Alert.alert(
        'Không lưu được',
        error.response?.data?.message || error.message || 'Vui lòng thử lại sau.'
      );
    }
  }

  const classInfo = query.data?.classInfo;
  const subtitle = classInfo
    ? `${classInfo.name} · ${query.data?.stats?.totalStudents ?? 0} học sinh`
    : undefined;

  return (
    <View className="flex-1 bg-background">
      <AssessmentScreenHeader
        title="Đánh giá học kỳ"
        subtitle={subtitle}
        onBack={() => router.back()}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        {query.isPending ? (
          <AssessmentLoading label="Đang tải đánh giá học kỳ…" />
        ) : query.isError ? (
          <AssessmentError
            message={
              query.error?.response?.data?.message || query.error?.message || 'Lỗi không xác định.'
            }
            onRetry={() => query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : (
          <>
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
              <Text className="text-base font-medium text-foreground">
                Đánh giá theo 5 lĩnh vực phát triển
              </Text>

              <View className="mt-4">
                <SemesterTabSwitch value={semester} onChange={setSemester} />
              </View>

              <View className="mt-3 rounded-lg bg-secondary px-3 py-2">
                <Text className="text-xs text-foreground">
                  {classInfo?.semesterDates?.dateRangeLabel || '--'}
                </Text>
                <Text className="mt-0.5 text-xs text-muted-foreground">
                  {classInfo?.isStarted
                    ? `Đã tính đến ${classInfo?.calculatedUntilVN || '--'} · ${classInfo?.totalSchoolDays ?? 0} ngày`
                    : 'Chưa tính · học kỳ chưa bắt đầu'}
                </Text>
              </View>

              <View className="mt-3">
                <Input
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Tìm học sinh"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Tìm học sinh"
                />
              </View>

              {filtered.length === 0 ? (
                <AssessmentEmpty
                  icon={Search}
                  title={students.length === 0 ? 'Lớp chưa có học sinh' : 'Không tìm thấy học sinh'}
                  description={
                    students.length === 0
                      ? 'Lớp được phân công chưa có học sinh đang theo học.'
                      : 'Thử từ khoá khác theo tên hoặc mã học sinh.'
                  }
                />
              ) : (
                <View className="mt-3 gap-3">
                  {filtered.map((student) => (
                    <SemesterStudentCard
                      key={student.id}
                      student={student}
                      note={notes[student.id] ?? ''}
                      editable
                      onNoteChange={(value) =>
                        setNotes((current) => ({ ...current, [student.id]: value }))
                      }
                    />
                  ))}
                </View>
              )}
            </ScrollView>

            <View
              className="border-t border-border bg-background px-6 pt-2"
              style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
              <Button
                className="w-full"
                onPress={submitNotes}
                disabled={saveNotes.isPending}
                accessibilityState={{ busy: saveNotes.isPending }}
                accessibilityLabel={saveNotes.isPending ? 'Đang lưu đánh giá' : 'Lưu đánh giá'}>
                {saveNotes.isPending ? (
                  <ThemedSpinner />
                ) : (
                  <Text className="text-primary-foreground">Lưu đánh giá</Text>
                )}
              </Button>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
