import { AssessmentScreenHeader } from '@/components/ui/assessment-screen-header';
import { AssessmentError, AssessmentLoading } from '@/components/ui/assessment-state';
import { AssessmentSectionCard } from '@/components/ui/assessment-metric-row';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ThemedSpinner } from '@/components/ui/themed-spinner';
import { Textarea } from '@/components/ui/textarea';
import { useParentFeedback, useParentResults } from '@/features/assessment/hooks/useParentResults';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Cộng chuyên cần của các tuần trong tháng; null khi tháng chưa có buổi nào được điểm danh.
function summariseMonth(weeklyStats) {
  const weeks = Object.values(weeklyStats || {});
  const totals = weeks.reduce(
    (accumulator, week) => {
      accumulator.present += week?.attendancePresent || 0;
      accumulator.total += week?.attendanceTotal || 0;
      return accumulator;
    },
    { present: 0, total: 0 }
  );
  return totals;
}

export default function ParentContactBookScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const query = useParentResults();
  const feedback = useParentFeedback();
  const [draft, setDraft] = React.useState('');
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    if (query.data?.record && !hydrated) {
      setDraft(query.data.record.parentFeedback || '');
      setHydrated(true);
    }
  }, [query.data, hydrated]);

  async function submitFeedback() {
    const content = draft.trim();
    if (!content) {
      Alert.alert('Chưa có nội dung', 'Vui lòng nhập nhận xét trước khi lưu.');
      return;
    }
    try {
      await feedback.mutateAsync({
        month: query.data?.period?.month,
        year: query.data?.period?.year,
        feedback: content,
      });
      Alert.alert('Đã gửi', 'Phản hồi của bạn đã được gửi tới giáo viên chủ nhiệm.');
    } catch (error) {
      Alert.alert(
        'Không gửi được',
        error.response?.data?.message || error.message || 'Vui lòng thử lại sau.'
      );
    }
  }

  const data = query.data;
  const studentLabel = data?.student
    ? `${data.student.fullName} · ${data.classInfo?.name || '—'}`
    : undefined;
  const attendance = summariseMonth(data?.weeklyStats);
  // Staging trả record.id = null ngay cả khi tháng đã có phiếu đánh giá, nên nhận biết
  // "đã có phiếu" bằng dữ liệu thực: có hoa tuần, có nhận xét hoặc đã có phản hồi.
  const record = data?.record;
  const hasMonthRecord = Boolean(
    (record?.rosesCount ?? 0) > 0 ||
    Object.values(record?.weeks || {}).some(Boolean) ||
    (record?.teacherNotes || '').trim().length > 0 ||
    (record?.parentFeedback || '').trim().length > 0
  );

  return (
    <View className="flex-1 bg-background">
      <AssessmentScreenHeader
        title="Sổ liên lạc"
        subtitle={studentLabel}
        onBack={() => router.back()}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {query.isPending ? (
          <AssessmentLoading label="Đang tải sổ liên lạc…" />
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
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 }}>
              <View className="self-start rounded-lg bg-secondary px-3 py-2">
                <Text className="text-xs font-medium text-foreground">
                  {data?.period?.label || 'Chưa có kỳ đánh giá'}
                </Text>
              </View>

              {!hasMonthRecord ? (
                <View className="mt-4 rounded-xl border border-border bg-card px-4 py-4">
                  <Text className="text-sm font-medium text-foreground">Chưa có đánh giá</Text>
                  <Text className="mt-1 text-xs text-muted-foreground">
                    Giáo viên chưa ghi nhận sổ bé ngoan cho tháng này.
                  </Text>
                </View>
              ) : null}

              {hasMonthRecord ? (
                <View className="mt-4">
                  <AssessmentSectionCard title="Tổng kết tháng">
                    <Text className="text-sm text-foreground">
                      Đi học:{' '}
                      {attendance.total > 0
                        ? `${attendance.present}/${attendance.total} buổi`
                        : 'chưa có dữ liệu điểm danh'}
                    </Text>
                    <Text className="mt-1 text-sm text-foreground">
                      Hoa bé ngoan: {data?.record?.rosesCount ?? 0}/{data?.record?.maxRoses ?? 0}
                      {data?.record?.isLotus ? ' · Bé ngoan của tháng' : ''}
                    </Text>
                  </AssessmentSectionCard>
                </View>
              ) : null}

              {hasMonthRecord ? (
                <View className="mt-3">
                  <AssessmentSectionCard
                    title={`Nhận xét của ${data?.record?.evaluatorName || 'giáo viên'}`}>
                    <Text className="text-sm leading-5 text-foreground">
                      {data?.record?.teacherNotes || 'Chưa có nhận xét.'}
                    </Text>
                  </AssessmentSectionCard>
                </View>
              ) : null}

              {hasMonthRecord ? (
                <View className="mt-4 gap-2">
                  <Text className="text-sm font-medium text-foreground">
                    Phản hồi của phụ huynh
                  </Text>
                  {data?.record?.feedbackAt ? (
                    <Text className="text-[11px] text-muted-foreground">
                      Đã gửi phản hồi ngày {data.record.feedbackAt}
                    </Text>
                  ) : null}
                  <Textarea
                    value={draft}
                    onChangeText={setDraft}
                    placeholder="Viết nhận xét cho cô giáo…"
                    numberOfLines={5}
                    accessibilityLabel="Phản hồi của phụ huynh"
                  />
                </View>
              ) : null}
            </ScrollView>

            {hasMonthRecord ? (
              <View
                className="border-t border-border bg-background px-6 pt-2"
                style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
                <Button
                  className="w-full"
                  onPress={submitFeedback}
                  disabled={feedback.isPending}
                  accessibilityState={{ busy: feedback.isPending }}
                  accessibilityLabel={feedback.isPending ? 'Đang lưu phản hồi' : 'Lưu phản hồi'}>
                  {feedback.isPending ? (
                    <ThemedSpinner />
                  ) : (
                    <Text className="text-primary-foreground">Lưu phản hồi</Text>
                  )}
                </Button>
              </View>
            ) : null}
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
