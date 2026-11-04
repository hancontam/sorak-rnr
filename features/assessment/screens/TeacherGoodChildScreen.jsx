import { AssessmentScreenHeader } from '@/components/ui/assessment-screen-header';
import {
  AssessmentEmpty,
  AssessmentError,
  AssessmentLoading,
} from '@/components/ui/assessment-state';
import { GoodChildStudentCard } from '@/components/ui/good-child-student-card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ParentFeedbackSheet } from '@/components/ui/parent-feedback-sheet';
import { StudentInitialAvatar } from '@/components/ui/student-initial-avatar';
import { Text } from '@/components/ui/text';
import { useClassStudents } from '@/features/assessment/hooks/useClassStudents';
import { useMonthlyAssessment } from '@/features/assessment/hooks/useMonthlyAssessment';
import {
  isLotusByRoses,
  lotusTargetFor,
} from '@/features/assessment/lib/flower-criteria';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

const WEEK_KEYS = ['week1', 'week2', 'week3', 'week4', 'week5'];
const MONTH_PILL = { paddingHorizontal: 12, paddingVertical: 8 };

function resolveWeekKeys(totalWeeks) {
  const total = Number.isInteger(totalWeeks) && totalWeeks > 0 ? totalWeeks : 5;
  return WEEK_KEYS.slice(0, Math.min(total, WEEK_KEYS.length));
}

function countRoses(record) {
  if (!record) return 0;
  return WEEK_KEYS.reduce((sum, key) => sum + (record[key] ? 1 : 0), 0);
}

// Màn hình Sổ bé ngoan của Giáo viên (Chế độ xem - Read-only view)
// Hiển thị danh sách hoa bé ngoan theo tuần và tổng kết tháng của lớp được phân công.
export default function TeacherGoodChildScreen() {
  const router = useRouter();
  const assignedClass = useAuthStore((state) => state.user?.assignedClasses?.[0]);
  const classId = assignedClass?.classId;
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = React.useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState(now.getFullYear());
  const [activeWeek, setActiveWeek] = React.useState('week1');
  const [search, setSearch] = React.useState('');
  const [feedbackState, setFeedbackState] = React.useState({ open: false, index: 0 });

  const activeQuery = useMonthlyAssessment({
    classId,
    month: selectedMonth,
    year: selectedYear,
  });
  const classStudents = useClassStudents(classId);

  const data = activeQuery.data;
  const totalWeeks = data?.classInfo?.totalWeeks || 5;
  const weekKeys = React.useMemo(() => resolveWeekKeys(totalWeeks), [totalWeeks]);
  const monthEnded = Boolean(data?.classInfo?.isMonthEnded);
  const students = data?.students || [];

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

  const feedbackItems = React.useMemo(
    () =>
      students
        .filter((student) => (student.parentFeedback || '').trim().length > 0)
        .map((student) => ({
          id: student.id,
          studentName: student.name,
          studentCode: student.code,
          avatarUrl: avatarByCode[student.code],
          feedback: student.parentFeedback,
          feedbackAt: student.feedbackAt,
        })),
    [students, avatarByCode]
  );

  function shiftMonth(offset) {
    let nextMonth = selectedMonth + offset;
    let nextYear = selectedYear;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    } else if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
  }

  const isSummary = activeWeek === 'summary';
  const periodLabel = data?.classInfo?.monthLabel || `Tháng ${selectedMonth}/${selectedYear}`;

  return (
    <View className="flex-1 bg-background">
      <AssessmentScreenHeader
        title="Sổ bé ngoan"
        subtitle={data?.classInfo?.name ? `${data.classInfo.name}` : undefined}
        onBack={() => router.back()}
      />

      {activeQuery.isPending ? (
        <AssessmentLoading label="Đang tải sổ bé ngoan…" />
      ) : activeQuery.error ? (
        <AssessmentError
          message={
            activeQuery.error?.response?.data?.message ||
            activeQuery.error?.message ||
            'Lỗi không xác định.'
          }
          onRetry={() => activeQuery.refetch()}
          isRetrying={activeQuery.isFetching}
        />
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40 }}>
          {/* Bộ chọn tháng */}
          <View className="flex-row items-center justify-between">
            <Pressable
              className="size-8 items-center justify-center rounded-md bg-secondary"
              onPress={() => shiftMonth(-1)}
              accessibilityRole="button"
              accessibilityLabel="Tháng trước">
              <Icon as={ChevronLeft} size={16} strokeWidth={2} />
            </Pressable>
            <View style={MONTH_PILL} className="rounded-lg border border-border">
              <Text className="text-sm font-medium text-foreground">{periodLabel}</Text>
            </View>
            <Pressable
              className="size-8 items-center justify-center rounded-md bg-secondary"
              onPress={() => shiftMonth(1)}
              accessibilityRole="button"
              accessibilityLabel="Tháng sau">
              <Icon as={ChevronRight} size={16} strokeWidth={2} />
            </Pressable>
          </View>

          {!monthEnded ? (
            <View className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              <Text className="text-xs text-foreground">
                Tháng này đang diễn ra. Sổ bé ngoan tổng kết đầy đủ khi tháng kết thúc.
              </Text>
            </View>
          ) : null}

          {/* Tab tuần & Tổng kết */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            contentContainerStyle={{ gap: 8 }}>
            {weekKeys.map((key, index) => {
              const active = activeWeek === key;
              return (
                <Pressable
                  key={key}
                  className={`h-9 items-center justify-center rounded-lg px-3 ${
                    active ? 'bg-brand' : 'bg-secondary'
                  }`}
                  onPress={() => setActiveWeek(key)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}>
                  <Text
                    className={`text-[13px] font-medium ${
                      active ? 'text-brand-foreground' : 'text-muted-foreground'
                    }`}>
                    Tuần {index + 1}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              className={`h-9 items-center justify-center rounded-lg px-3 ${
                isSummary ? 'bg-brand' : 'bg-secondary'
              }`}
              onPress={() => setActiveWeek('summary')}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSummary }}>
              <Text
                className={`text-[13px] font-medium ${
                  isSummary ? 'text-brand-foreground' : 'text-muted-foreground'
                }`}>
                Tổng kết tháng
              </Text>
            </Pressable>
          </ScrollView>

          {/* Ô tìm kiếm */}
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
                students.length === 0 ? 'Chưa có dữ liệu tháng này' : 'Không tìm thấy học sinh'
              }
              description={
                students.length === 0
                  ? 'Chưa có dữ liệu đánh giá bé ngoan cho tháng đã chọn.'
                  : 'Thử từ khoá khác theo tên hoặc mã học sinh.'
              }
            />
          ) : (
            <View className="mt-3 gap-2">
              {isSummary
                ? filtered.map((student) => {
                    const record = {
                      week1: Boolean(student.week1Rose),
                      week2: Boolean(student.week2Rose),
                      week3: Boolean(student.week3Rose),
                      week4: Boolean(student.week4Rose),
                      week5: Boolean(student.week5Rose),
                    };
                    const roses = countRoses(record);
                    const lotus = isLotusByRoses(roses, totalWeeks);
                    const hasFeedback = (student.parentFeedback || '').trim().length > 0;
                    return (
                      <View
                        key={student.id}
                        className="gap-2 rounded-xl border border-border bg-card px-3 py-3">
                        <View className="flex-row items-center gap-2">
                          <StudentInitialAvatar
                            name={student.name}
                            code={student.code}
                            uri={avatarByCode[student.code]}
                          />
                          <View className="flex-1">
                            <Text
                              className="text-sm font-medium text-foreground"
                              numberOfLines={1}>
                              {student.name}
                            </Text>
                            <Text className="text-[11px] text-muted-foreground">
                              {student.code}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row items-center gap-2">
                          <Text className="text-xs font-medium text-foreground">
                            {roses}/{totalWeeks} hoa hồng
                          </Text>
                          <Text
                            className={`text-xs font-medium ${lotus ? 'text-brand-link' : 'text-muted-foreground'}`}>
                            {lotus ? 'Đạt Hoa sen' : 'Chưa đạt hoa sen'}
                          </Text>
                        </View>
                        <Text className="text-[11px] text-muted-foreground">
                          Mốc hoa sen: {lotusTargetFor(totalWeeks)}/{totalWeeks} hoa
                        </Text>

                        {/* Lời bình hiển thị dạng view-only */}
                        <View className="gap-1">
                          <Text className="text-[11px] font-medium text-muted-foreground">
                            Lời bình của cô
                          </Text>
                          <View className="min-h-[44px] justify-center rounded-lg border border-border bg-muted/20 px-3 py-2">
                            <Text className="text-xs text-foreground leading-relaxed">
                              {student.teacherNotes || 'Chưa có lời bình.'}
                            </Text>
                          </View>
                        </View>

                        {hasFeedback ? (
                          <Pressable
                            onPress={() =>
                              setFeedbackState({
                                open: true,
                                index: Math.max(
                                  feedbackItems.findIndex((item) => item.id === student.id),
                                  0
                                ),
                              })
                            }
                            accessibilityRole="button"
                            accessibilityLabel={`Xem phản hồi của phụ huynh ${student.name}`}>
                            <Text className="text-[11px] text-brand-link" numberOfLines={2}>
                              Phụ huynh: {student.parentFeedback}
                            </Text>
                          </Pressable>
                        ) : (
                          <Text className="text-[11px] text-muted-foreground">
                            Phụ huynh chưa phản hồi.
                          </Text>
                        )}
                      </View>
                    );
                  })
                : filtered.map((student) => {
                    const roseActive = Boolean(
                      activeWeek === 'week1'
                        ? student.week1Rose
                        : activeWeek === 'week2'
                          ? student.week2Rose
                          : activeWeek === 'week3'
                            ? student.week3Rose
                            : activeWeek === 'week4'
                              ? student.week4Rose
                              : student.week5Rose
                    );
                    return (
                      <GoodChildStudentCard
                        key={student.id}
                        student={student}
                        weekKey={activeWeek}
                        avatarUrl={avatarByCode[student.code]}
                        roseActive={roseActive}
                        readOnly
                      />
                    );
                  })}
            </View>
          )}

          {feedbackItems.length > 0 ? (
            <Pressable
              className="mt-3 h-10 items-center justify-center rounded-lg border border-border"
              onPress={() => setFeedbackState({ open: true, index: 0 })}
              accessibilityRole="button"
              accessibilityLabel="Xem ý kiến phản hồi của phụ huynh">
              <Text className="text-[13px] font-medium text-foreground">
                Ý kiến phản hồi từ phụ huynh ({feedbackItems.length})
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      )}

      <ParentFeedbackSheet
        open={feedbackState.open}
        onOpenChange={(open) => setFeedbackState((current) => ({ ...current, open }))}
        items={feedbackItems}
        initialIndex={feedbackState.index}
      />
    </View>
  );
}
