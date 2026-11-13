import { useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { reportError, schoolYearValue, semesterDateRange } from '../utils/report-format';
import { ReportRecord } from './ReportRecord';
import { ReportState } from './ReportState';
import { StudentProfile } from './StudentProfile';
import { StudentSummary } from './StudentSummary';
import { WhoGrowthChart } from './WhoGrowthChart';

const sections = [
  ['profile', 'Hồ sơ'],
  ['health', 'Sức khỏe'],
  ['attendance', 'Điểm danh'],
  ['assessments', 'Đánh giá hoạt động'],
  ['authorizations', 'Ủy quyền đưa đón'],
];
const semesters = [
  ['SEMESTER_1', 'Học kỳ 1'],
  ['SEMESTER_2', 'Học kỳ 2'],
  ['ALL', 'Cả năm'],
];

export function StudentReport({ query, error, semester, onSemesterChange }) {
  const t = useTranslation();
  const locale = useLocale();
  const [section, setSection] = useState('profile');
  const list = useRef(null);
  const report = query.data;
  const switchSection = (value) => {
    setSection(value);
    list.current?.scrollToOffset({ offset: 0, animated: false });
  };
  if (error || !report)
    return (
      <View className="flex-1 gap-4 bg-background p-4">
        {!error ? <SemesterPicker value={semester} onChange={onSemesterChange} /> : null}
        <ReportState
          loading={!error && query.isPending}
          error={error || (query.error && reportError(query.error))}
          onRetry={!error ? query.refetch : undefined}
        />
      </View>
    );
  if (!report.student)
    return (
      <View className="flex-1 bg-background p-4">
        <ReportState
          title="Chưa có hồ sơ trẻ"
          description="Nhà trường chưa có hồ sơ phù hợp với tài khoản này."
        />
      </View>
    );
  const records = section === 'profile' ? [{ id: 'profile' }] : report[section].history;
  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <View className="mx-auto w-full max-w-xl gap-3 border-b border-border px-4 pb-3 pt-4">
        <StudentSummary student={report.student} className={report.classInfo.name} />
        <SemesterPicker
          value={semester || report.semesterInfo.selectedSemester}
          onChange={onSemesterChange}
        />
        <Text className="font-mono text-2xs text-muted-foreground">
          {report.semesterInfo.activeDateRangeLabel
            ? semesterDateRange(report.semesterInfo.activeDateRangeLabel, locale)
            : report.classInfo.schoolYear
              ? t('Năm học {year}', { year: schoolYearValue(report.classInfo.schoolYear) })
              : null}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
          accessibilityRole="tablist">
          {sections.map(([value, label]) => {
            const selected = value === section;
            return (
              <Pressable
                key={value}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                hitSlop={4}
                onPress={() => switchSection(value)}
                className={cn(
                  'h-9 shrink-0 justify-center rounded-full border px-3.5 active:opacity-70',
                  selected ? 'border-primary bg-primary' : 'border-border bg-background'
                )}>
                <Text
                  numberOfLines={1}
                  className={cn(
                    'text-xs font-medium',
                    selected ? 'text-primary-foreground' : 'text-foreground'
                  )}>
                  {t(label)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <FlatList
        ref={list}
        data={records}
        keyExtractor={(item, index) => String(item.publicId || item.id || `${section}-${index}`)}
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-xl gap-3 p-4 pb-8"
        refreshing={query.isRefetching}
        onRefresh={query.refetch}
        ListHeaderComponent={
          <View className="gap-4">
            {query.isError ? (
              <ReportState error={reportError(query.error)} onRetry={query.refetch} />
            ) : null}
            {section === 'health' ? (
              <>
                <WhoGrowthChart student={report.student} history={records} metric="height" />
                <WhoGrowthChart student={report.student} history={records} metric="weight" />
                <Text className="text-sm font-semibold">
                  {t('Lịch sử đo sức khỏe · {count} đợt', { count: records.length })}
                </Text>
              </>
            ) : null}
            {section === 'attendance' ? (
              <View className="flex-row gap-3">
                <Stat label={t('Ngày có bản ghi')} value={String(records.length)} />
                <Stat
                  label={t('Chuyên cần')}
                  value={
                    records.length && typeof report.attendance.attendanceRate === 'number'
                      ? (report.attendance.attendanceRate / 100).toLocaleString(locale, {
                          style: 'percent',
                          maximumFractionDigits: 2,
                        })
                      : '—'
                  }
                />
              </View>
            ) : null}
            {section === 'assessments' ? (
              <Text className="text-xs text-muted-foreground">
                {t('{count} bản ghi đánh giá hoạt động trong kỳ', { count: records.length })}
              </Text>
            ) : null}
            {section === 'authorizations' ? (
              <Text className="text-xs text-muted-foreground">
                {t('{count} đơn trong kỳ · Chỉ xem lịch sử', { count: records.length })}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <ReportState
            title="Chưa có bản ghi trong kỳ này"
            description="Bạn có thể chọn học kỳ khác hoặc kéo xuống để tải lại."
          />
        }
        renderItem={({ item }) =>
          section === 'profile' ? (
            <StudentProfile report={report} />
          ) : (
            <ReportRecord section={section} record={item} />
          )
        }
      />
    </SafeAreaView>
  );
}

// Số liệu tóm tắt từ báo cáo (mono), không tự suy ra khi máy chủ không trả.
function Stat({ label, value }) {
  return (
    <Card className="min-w-0 flex-1 gap-1 px-4 py-3">
      <Text className="text-2xs text-muted-foreground">{label}</Text>
      <Text className="font-mono text-lg font-semibold">{value}</Text>
    </Card>
  );
}

function SemesterPicker({ value, onChange }) {
  const t = useTranslation();
  return (
    <Tabs value={value || ''} onValueChange={onChange}>
      <TabsList className="w-full">
        {semesters.map(([key, label]) => (
          <TabsTrigger key={key} value={key} hitSlop={5} className="flex-1">
            <Text>{t(label)}</Text>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
