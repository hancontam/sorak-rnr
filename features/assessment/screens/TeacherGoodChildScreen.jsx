import { AssessmentScreenHeader } from '@/components/ui/assessment-screen-header';
import {
  AssessmentEmpty,
  AssessmentError,
  AssessmentLoading,
} from '@/components/ui/assessment-state';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FlowerCriteriaSheet } from '@/components/ui/flower-criteria-sheet';
import { GoodChildStudentCard } from '@/components/ui/good-child-student-card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ParentFeedbackSheet } from '@/components/ui/parent-feedback-sheet';
import { StudentInitialAvatar } from '@/components/ui/student-initial-avatar';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { ThemedSpinner } from '@/components/ui/themed-spinner';
import { useClassStudents } from '@/features/assessment/hooks/useClassStudents';
import { useFlowerCriteria } from '@/features/assessment/hooks/useFlowerCriteria';
import { useMonthlyAssessment } from '@/features/assessment/hooks/useMonthlyAssessment';
import { useSaveMonthlyAssessment } from '@/features/assessment/hooks/useSaveMonthlyAssessment';
import { describeSaveError } from '@/features/assessment/lib/assessment-format';
import {
  isLotusByRoses,
  isWeekEligible,
  lotusTargetFor,
} from '@/features/assessment/lib/flower-criteria';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Search, Settings, Sparkles } from 'lucide-react-native';
import * as React from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WEEK_KEYS = ['week1', 'week2', 'week3', 'week4', 'week5'];
const MONTH_PILL = { paddingHorizontal: 12, paddingVertical: 8 };

// Endpoint tháng của giáo viên không trả monthWeeks; số tuần nằm ở classInfo.totalWeeks.
function resolveWeekKeys(totalWeeks) {
  const total = Number.isInteger(totalWeeks) && totalWeeks > 0 ? totalWeeks : 5;
  return WEEK_KEYS.slice(0, Math.min(total, WEEK_KEYS.length));
}

function buildDraft(students) {
  return (students || []).reduce((accumulator, student) => {
    accumulator[student.id] = {
      week1Rose: Boolean(student.week1Rose),
      week2Rose: Boolean(student.week2Rose),
      week3Rose: Boolean(student.week3Rose),
      week4Rose: Boolean(student.week4Rose),
      week5Rose: Boolean(student.week5Rose),
      teacherNotes: student.teacherNotes || '',
    };
    return accumulator;
  }, {});
}

function countRoses(record) {
  return WEEK_KEYS.reduce((total, key) => total + (record?.[key] ? 1 : 0), 0);
}

export default function TeacherGoodChildScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const assignedClass = useAuthStore((state) => state.user?.assignedClasses?.[0]);
  const classId = assignedClass?.classId;

  const [search, setSearch] = React.useState('');
  const [activeWeek, setActiveWeek] = React.useState('week1');
  // null: dùng tháng hiện tại do backend chọn; có giá trị sau khi người dùng đổi tháng.
  const [period, setPeriod] = React.useState(null);
  const [draft, setDraft] = React.useState({});
  const [initialDraft, setInitialDraft] = React.useState({});
  const [isCriteriaOpen, setIsCriteriaOpen] = React.useState(false);
  const [feedbackState, setFeedbackState] = React.useState({ open: false, index: 0 });

  const activeQuery = useMonthlyAssessment({ classId, month: period?.month, year: period?.year });
  const classStudents = useClassStudents(classId);
  const saveMonthly = useSaveMonthlyAssessment();
  const flowerCriteria = useFlowerCriteria();

  const data = activeQuery.data;
  const weekKeys = resolveWeekKeys(data?.classInfo?.totalWeeks);
  const totalWeeks = weekKeys.length;
  const isSummary = activeWeek === 'summary';
  const monthEnded = data?.classInfo?.isEnded !== false;

  const avatarByCode = React.useMemo(
    () =>
      (classStudents.data?.students || []).reduce((accumulator, student) => {
        if (student.avatarUrl) accumulator[student.studentCode] = student.avatarUrl;
        return accumulator;
      }, {}),
    [classStudents.data]
  );

  // Nạp lại bản nháp mỗi khi dữ liệu tháng/học kỳ thay đổi.
  React.useEffect(() => {
    if (!data) return;
    const next = buildDraft(data.students);
    setDraft(next);
    setInitialDraft(next);
  }, [data]);

  const students = data?.students || [];
  const filtered = students.filter((student) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    return (
      (student.name || '').toLowerCase().includes(keyword) ||
      (student.code || '').toLowerCase().includes(keyword)
    );
  });

  const feedbackItems = students
    .map((student) => ({
      id: student.id,
      name: student.name,
      code: student.code,
      rosesCount: draft[student.id] ? countRoses(draft[student.id]) : student.rosesCount,
      maxRoses: totalWeeks,
      feedback: student.parentFeedback,
      feedbackAt: student.feedbackAt,
      feedbackBy: student.feedbackBy,
    }))
    .filter((item) => (item.feedback || '').trim().length > 0);

  const isDirty = React.useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraft),
    [draft, initialDraft]
  );

  function shiftMonth(direction) {
    const baseMonth = data?.classInfo?.month;
    const baseYear = data?.classInfo?.year;
    if (!baseMonth || !baseYear) return;
    const next = new Date(baseYear, baseMonth - 1 + direction, 1);
    setPeriod({ month: next.getMonth() + 1, year: next.getFullYear() });
  }

  // Tặng hoa nhanh: xét toàn bộ tuần của tháng đang xem theo tiêu chí đã cấu hình, giống web.
  // Chỉ đổi bản nháp trên máy; dữ liệu chỉ lên backend khi bấm "Lưu sổ bé ngoan".
  function applyQuickGift() {
    if (!monthEnded) {
      Alert.alert(
        'Tháng chưa kết thúc',
        `${data?.classInfo?.monthLabel || 'Tháng này'} chưa kết thúc nên chưa thể xét tặng hoa.`
      );
      return;
    }

    // Tính bản nháp mới trước rồi mới set state, để đếm hoa đúng một lần.
    const nextDraft = { ...draft };
    let awarded = 0;
    students.forEach((student) => {
      const record = { ...nextDraft[student.id] };
      weekKeys.forEach((weekKey) => {
        const eligible = isWeekEligible(student.weeklyStats?.[weekKey], flowerCriteria.criteria);
        record[weekKey] = eligible;
        if (eligible) awarded += 1;
      });
      nextDraft[student.id] = record;
    });

    setDraft(nextDraft);
    Alert.alert(
      'Đã gợi ý tặng hoa',
      `Đã xét ${weekKeys.length} tuần và tặng ${awarded} hoa theo tiêu chí hiện tại. Bấm "Lưu sổ bé ngoan" để gửi lên hệ thống.`
    );
  }

  function toggleWeekRose(studentId, weekKey) {
    setDraft((current) => ({
      ...current,
      [studentId]: {
        ...current[studentId],
        [weekKey]: !current[studentId]?.[weekKey],
      },
    }));
  }

  function setTeacherNote(studentId, value) {
    setDraft((current) => ({
      ...current,
      [studentId]: { ...current[studentId], teacherNotes: value },
    }));
  }

  async function submitMonthly() {
    const records = students.map((student) => ({
      studentId: student.id,
      week1Rose: Boolean(draft[student.id]?.week1Rose),
      week2Rose: Boolean(draft[student.id]?.week2Rose),
      week3Rose: Boolean(draft[student.id]?.week3Rose),
      week4Rose: Boolean(draft[student.id]?.week4Rose),
      week5Rose: Boolean(draft[student.id]?.week5Rose),
      teacherNotes: draft[student.id]?.teacherNotes ?? '',
    }));
    try {
      await saveMonthly.mutateAsync({
        classId,
        month: data?.classInfo?.month,
        year: data?.classInfo?.year,
        records,
      });
      setInitialDraft(draft);
      Alert.alert('Đã lưu', 'Sổ bé ngoan đã được lưu.');
    } catch (error) {
      Alert.alert('Không lưu được sổ bé ngoan', describeSaveError(error));
    }
  }

  const periodLabel = data?.classInfo?.monthLabel || 'Đang tải…';

  const headerAction = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable
          className="size-8 items-center justify-center rounded-md border border-border bg-background"
          accessibilityRole="button"
          accessibilityLabel="Mở menu sổ bé ngoan">
          <Icon as={Settings} size={16} strokeWidth={2} />
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onPress={() => setIsCriteriaOpen(true)}>
          <Icon as={Settings} size={16} strokeWidth={2} />
          <Text>Cấu hình tặng hoa</Text>
        </DropdownMenuItem>
        <DropdownMenuItem onPress={applyQuickGift}>
          <Icon as={Sparkles} size={16} strokeWidth={2} />
          <Text>Tặng hoa nhanh</Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <View className="flex-1 bg-background">
      <AssessmentScreenHeader
        title="Sổ bé ngoan"
        subtitle={data?.classInfo?.name ? `${data.classInfo.name}` : undefined}
        onBack={() => router.back()}
        action={headerAction}
      />

      {activeQuery.isPending ? (
        <AssessmentLoading label="Đang tải sổ bé ngoan…" />
      ) : activeQuery.isError ? (
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
        <>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 }}>
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
                  Tháng này chưa kết thúc. Theo quy định, sổ bé ngoan chỉ xét và trao hoa khi tháng
                  đã kết thúc.
                </Text>
              </View>
            ) : null}

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
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`Tuần ${index + 1}`}>
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
                accessibilityState={{ selected: isSummary }}
                accessibilityLabel="Tổng kết tháng">
                <Text
                  className={`text-[13px] font-medium ${
                    isSummary ? 'text-brand-foreground' : 'text-muted-foreground'
                  }`}>
                  Tổng kết tháng
                </Text>
              </Pressable>
            </ScrollView>

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
                    ? 'Giáo viên chưa ghi nhận đánh giá cho tháng đã chọn.'
                    : 'Thử từ khoá khác theo tên hoặc mã học sinh.'
                }
              />
            ) : (
              <View className="mt-3 gap-2">
                {isSummary
                  ? filtered.map((student) => {
                      const record = draft[student.id] || {};
                      const roses = countRoses(record);
                      const lotus = isLotusByRoses(roses, totalWeeks);
                      const hasFeedback = (student.parentFeedback || '').trim().length > 0;
                      return (
                        <View
                          key={student.id}
                          className="gap-1.5 rounded-xl border border-border bg-card px-3 py-3">
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
                              {lotus ? 'Hoa sen' : 'Chưa có hoa sen'}
                            </Text>
                          </View>
                          <Text className="text-[11px] text-muted-foreground">
                            Mốc hoa sen: {lotusTargetFor(totalWeeks)}/{totalWeeks} hoa
                          </Text>

                          <Text className="text-[11px] font-medium text-muted-foreground">
                            Lời bình của cô
                          </Text>
                          <Textarea
                            className="min-h-14"
                            numberOfLines={3}
                            value={record.teacherNotes ?? ''}
                            onChangeText={(value) => setTeacherNote(student.id, value)}
                            placeholder="Nhập lời bình cho bé..."
                            accessibilityLabel={`Lời bình của giáo viên cho ${student.name}`}
                          />

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
                  : filtered.map((student) => (
                      <GoodChildStudentCard
                        key={student.id}
                        student={student}
                        weekKey={activeWeek}
                        avatarUrl={avatarByCode[student.code]}
                        roseActive={Boolean(draft[student.id]?.[activeWeek])}
                        onToggleRose={() => toggleWeekRose(student.id, activeWeek)}
                      />
                    ))}
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

          <View
            className="border-t border-border bg-background px-6 pt-2"
            style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
            <Button
              className="w-full"
              onPress={submitMonthly}
              disabled={!isDirty || saveMonthly.isPending}
              accessibilityState={{ busy: saveMonthly.isPending }}
              accessibilityLabel={
                saveMonthly.isPending ? 'Đang lưu sổ bé ngoan' : 'Lưu sổ bé ngoan'
              }>
              {saveMonthly.isPending ? (
                <ThemedSpinner />
              ) : (
                <Text className="text-primary-foreground">
                  {isDirty ? 'Lưu sổ bé ngoan' : 'Đã lưu'}
                </Text>
              )}
            </Button>
          </View>
        </>
      )}

      <FlowerCriteriaSheet
        open={isCriteriaOpen}
        onOpenChange={setIsCriteriaOpen}
        initialCriteria={flowerCriteria.criteria}
        isSaving={flowerCriteria.isSaving}
        error={flowerCriteria.error}
        onSave={async (nextCriteria) => {
          try {
            await flowerCriteria.persist(nextCriteria);
            setIsCriteriaOpen(false);
          } catch {
            // Lỗi đã được hook ghi vào error để sheet hiển thị.
          }
        }}
      />

      <ParentFeedbackSheet
        open={feedbackState.open}
        onOpenChange={(open) => setFeedbackState((current) => ({ ...current, open }))}
        items={feedbackItems}
        initialIndex={feedbackState.index}
      />
    </View>
  );
}
