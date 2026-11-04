import { AssessmentScreenHeader } from '@/components/ui/assessment-screen-header';
import {
  AssessmentEmpty,
  AssessmentError,
  AssessmentLoading,
} from '@/components/ui/assessment-state';
import { GoodChildStudentCard } from '@/components/ui/good-child-student-card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useMonthlyAssessment } from '@/features/assessment/hooks/useMonthlyAssessment';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Rose, Search } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

const WEEK_KEYS = ['week1', 'week2', 'week3', 'week4', 'week5'];
const MONTH_PILL = { paddingHorizontal: 12, paddingVertical: 8 };

// Endpoint tháng của giáo viên không trả monthWeeks; số tuần nằm ở classInfo.totalWeeks.
function resolveWeekKeys(totalWeeks) {
  const total = Number.isInteger(totalWeeks) && totalWeeks > 0 ? totalWeeks : 5;
  return WEEK_KEYS.slice(0, Math.min(total, WEEK_KEYS.length));
}

export default function TeacherGoodChildScreen() {
  const router = useRouter();
  const assignedClass = useAuthStore((state) => state.user?.assignedClasses?.[0]);
  const classId = assignedClass?.classId;
  const [search, setSearch] = React.useState('');
  const [activeWeek, setActiveWeek] = React.useState('week1');
  // null: dùng tháng hiện tại do backend chọn; có giá trị sau khi người dùng đổi tháng.
  const [period, setPeriod] = React.useState(null);

  const activeQuery = useMonthlyAssessment({
    classId,
    month: period?.month,
    year: period?.year,
  });
  const data = activeQuery.data;
  const weekKeys = resolveWeekKeys(data?.classInfo?.totalWeeks);
  const isSummary = activeWeek === 'summary';

  const filtered = (data?.students || []).filter((student) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    return (
      (student.name || '').toLowerCase().includes(keyword) ||
      (student.code || '').toLowerCase().includes(keyword)
    );
  });

  function shiftMonth(direction) {
    const baseMonth = data?.classInfo?.month;
    const baseYear = data?.classInfo?.year;
    if (!baseMonth || !baseYear) return;
    const next = new Date(baseYear, baseMonth - 1 + direction, 1);
    setPeriod({ month: next.getMonth() + 1, year: next.getFullYear() });
  }

  const periodLabel = data?.classInfo?.monthLabel || 'Đang tải…';

  return (
    <View className="flex-1 bg-background">
      <AssessmentScreenHeader
        title="Sổ bé ngoan"
        subtitle={data?.classInfo?.name ? `${data.classInfo.name}` : undefined}
        onBack={() => router.back()}
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
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 96 }}>
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
                (data?.students?.length ?? 0) === 0
                  ? 'Chưa có dữ liệu tháng này'
                  : 'Không tìm thấy học sinh'
              }
              description={
                (data?.students?.length ?? 0) === 0
                  ? 'Giáo viên chưa ghi nhận đánh giá cho tháng đã chọn.'
                  : 'Thử từ khoá khác theo tên hoặc mã học sinh.'
              }
            />
          ) : (
            <View className="mt-3 gap-2">
              {isSummary
                ? filtered.map((student) => (
                    <View
                      key={student.id}
                      className="flex-row items-center gap-2 rounded-xl border border-border bg-card px-3 py-3">
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                          {student.name}
                        </Text>
                        <Text className="text-[11px] text-muted-foreground">{student.code}</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Icon as={Rose} size={16} strokeWidth={2} className="text-rose-500" />
                        <Text className="text-xs font-medium text-foreground">
                          {student.rosesCount ?? 0}/5
                        </Text>
                      </View>
                    </View>
                  ))
                : filtered.map((student) => (
                    <GoodChildStudentCard key={student.id} student={student} weekKey={activeWeek} />
                  ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
