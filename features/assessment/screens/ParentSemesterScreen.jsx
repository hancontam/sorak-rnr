import { AssessmentScreenHeader } from '@/components/ui/assessment-screen-header';
import { AssessmentError, AssessmentLoading } from '@/components/ui/assessment-state';
import { AssessmentMetricRow, AssessmentSectionCard } from '@/components/ui/assessment-metric-row';
import { SemesterTabSwitch } from '@/components/ui/semester-tab-switch';
import { Text } from '@/components/ui/text';
import { useParentResults } from '@/features/assessment/hooks/useParentResults';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

export default function ParentSemesterScreen() {
  const router = useRouter();
  const [semester, setSemester] = useState('SEMESTER_1');
  const query = useParentResults();
  const data = query.data;
  // Only the parent's own results. Never request a teacher's class-wide endpoint.
  const record = data?.semesterAssessments?.find((item) => item.semester === semester);
  const domains = Array.isArray(record?.domains) ? record.domains : [];
  const subtitle = data?.student
    ? `${data.student.fullName} · ${data.classInfo?.name || 'Chưa có lớp'}`
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
          message={query.error?.response?.data?.message || query.error.message}
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
            {record?.schoolYear || data?.classInfo?.schoolYear}
          </Text>
          {!record ? (
            <View className="mt-4 rounded-xl border border-border bg-card p-4">
              <Text className="text-sm font-medium">
                Chưa có đánh giá học kỳ {semester === 'SEMESTER_1' ? '1' : '2'}
              </Text>
              <Text className="mt-1 text-xs leading-5 text-muted-foreground">
                Kết quả và nhận xét sẽ xuất hiện khi giáo viên công bố đánh giá của con.
              </Text>
            </View>
          ) : (
            <>
              <View className="mt-4">
                <AssessmentSectionCard title="5 lĩnh vực phát triển">
                  {domains.length && record.hasEvaluatedGoals !== false ? (
                    domains.map((domain, index) => (
                      <AssessmentMetricRow
                        key={domain.name || index}
                        label={domain.name}
                        value={
                          [
                            domain.rating,
                            typeof domain.score === 'number' ? `${domain.score}%` : null,
                          ]
                            .filter(Boolean)
                            .join(' · ') || 'Chưa có kết quả'
                        }
                      />
                    ))
                  ) : (
                    <Text className="py-2 text-xs text-muted-foreground">
                      Chưa có kết quả chi tiết các lĩnh vực.
                    </Text>
                  )}
                </AssessmentSectionCard>
              </View>
              <View className="mt-3">
                <AssessmentSectionCard
                  title={`Nhận xét của ${record.evaluatorName || 'giáo viên'}`}>
                  <Text className="text-sm leading-5">
                    {record.teacherNotes || 'Giáo viên chưa ghi nhận xét.'}
                  </Text>
                  {record.createdAt ? (
                    <Text className="mt-2 text-[11px] text-muted-foreground">
                      Cập nhật {record.createdAt}
                    </Text>
                  ) : null}
                </AssessmentSectionCard>
              </View>
            </>
          )}
          <Text className="mt-4 text-xs leading-5 text-muted-foreground">
            Để trao đổi với giáo viên, gửi phản hồi trong Sổ liên lạc theo tháng.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}
