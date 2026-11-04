import { AssessmentScreenHeader } from '@/components/ui/assessment-screen-header';
import { AssessmentError, AssessmentLoading } from '@/components/ui/assessment-state';
import { AssessmentMetricRow, AssessmentSectionCard } from '@/components/ui/assessment-metric-row';
import { SemesterTabSwitch } from '@/components/ui/semester-tab-switch';
import { Text } from '@/components/ui/text';
import { useSemesterAssessment } from '@/features/assessment/hooks/useSemesterAssessment';
import { useParentResults } from '@/features/assessment/hooks/useParentResults';
import {
  DOMAIN_FIELDS,
  formatDomainResult,
  formatPercent,
  formatSemesterPeriod,
} from '@/features/assessment/lib/assessment-format';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

export default function ParentSemesterScreen() {
  const router = useRouter();
  const student = useAuthStore((state) => state.user?.student);
  const classId = student?.classId;
  const [semester, setSemester] = React.useState('SEMESTER_1');

  // Dữ liệu 5 lĩnh vực thật nằm ở endpoint theo lớp; mobile chỉ đọc đúng học sinh của mình.
  const query = useSemesterAssessment({ classId, semester });
  const results = useParentResults();

  const classInfo = query.data?.classInfo;
  const own = (query.data?.students || []).find((item) => item.id === student?.id);
  const savedAssessment = (results.data?.semesterAssessments || []).find(
    (item) => item.semester === semester
  );

  const subtitle = student
    ? `${student.fullName} · ${results.data?.classInfo?.name || student.className || '—'}`
    : undefined;

  return (
    <View className="flex-1 bg-background">
      <AssessmentScreenHeader
        title="Đánh giá học kỳ"
        subtitle={subtitle}
        onBack={() => router.back()}
      />
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
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 }}>
          <SemesterTabSwitch value={semester} onChange={setSemester} />

          <Text className="mt-2 text-[11px] text-muted-foreground">
            {formatSemesterPeriod(classInfo) || 'Chưa có thông tin học kỳ'}
          </Text>

          {!classInfo?.isStarted ? (
            <View className="mt-4 rounded-xl border border-border bg-card px-4 py-4">
              <Text className="text-sm font-medium text-foreground">
                {semester === 'SEMESTER_2'
                  ? 'Chưa có đánh giá học kỳ 2'
                  : 'Chưa có đánh giá học kỳ 1'}
              </Text>
              <Text className="mt-1 text-xs text-muted-foreground">
                Kết quả và nhận xét của giáo viên sẽ xuất hiện khi học kỳ được công bố.
              </Text>
            </View>
          ) : (
            <>
              <View className="mt-4">
                <AssessmentSectionCard title="5 lĩnh vực phát triển">
                  {own?.hasEvaluatedGoals ? (
                    DOMAIN_FIELDS.map((domain) => (
                      <AssessmentMetricRow
                        key={domain.key}
                        label={domain.label}
                        value={formatDomainResult(own.domainBreakdown?.[domain.key])}
                      />
                    ))
                  ) : (
                    <Text className="py-2 text-xs text-muted-foreground">
                      Chưa có mục tiêu nào được giáo viên đánh giá trong học kỳ này.
                    </Text>
                  )}
                </AssessmentSectionCard>
              </View>

              <View className="mt-3">
                <AssessmentSectionCard title="Chuyên cần và sức khỏe">
                  <AssessmentMetricRow
                    label="Đi học đủ"
                    value={formatPercent(own?.attendance?.rate)}
                  />
                  <AssessmentMetricRow
                    label="Sức khỏe"
                    value={own?.health?.status || 'Chưa đánh giá'}
                  />
                  {own?.health?.examDate && own.health.examDate !== '--' ? (
                    <AssessmentMetricRow label="Lần khám gần nhất" value={own.health.examDate} />
                  ) : null}
                </AssessmentSectionCard>
              </View>

              <View className="mt-3">
                <AssessmentSectionCard
                  title={`Nhận xét của ${savedAssessment?.evaluatorName || 'giáo viên chủ nhiệm'}`}>
                  <Text className="text-sm leading-5 text-foreground">
                    {savedAssessment?.teacherNotes ||
                      own?.teacherNotes ||
                      'Giáo viên chưa ghi nhận xét cho học kỳ này.'}
                  </Text>
                  {savedAssessment?.createdAt ? (
                    <Text className="mt-2 text-[11px] text-muted-foreground">
                      Cập nhật {savedAssessment.createdAt}
                    </Text>
                  ) : null}
                </AssessmentSectionCard>
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
