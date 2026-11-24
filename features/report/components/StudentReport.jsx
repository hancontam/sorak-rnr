import { useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePullToRefresh } from '@/components/shared/usePullToRefresh';
import { ChipTabs } from '@/components/shared/ChipTabs';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
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

export function StudentReport({ query, error, semester, onSemesterChange, parentView, teachers }) {
  const t = useTranslation();
  const locale = useLocale();
  const [section, setSection] = useState('profile');
  const list = useRef(null);
  const report = query.data;
  const pull = usePullToRefresh(query.refetch);
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
          skeleton="cards"
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
        <ChipTabs
          options={sections.map(([value, label]) => ({ value, label: t(label) }))}
          value={section}
          onChange={switchSection}
        />
      </View>
      <FlatList
        ref={list}
        data={records}
        keyExtractor={(item, index) => String(item.publicId || item.id || `${section}-${index}`)}
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-xl gap-3 p-4 pb-8"
        refreshing={pull.refreshing}
        onRefresh={pull.onRefresh}
        ListHeaderComponent={
          <View className="gap-4">
            {query.isError ? (
              <ReportState error={reportError(query.error)} onRetry={query.refetch} />
            ) : null}
            <SectionSummary section={section} report={report} />
            {section === 'health' ? (
              <>
                <WhoGrowthChart student={report.student} history={records} metric="height" />
                <WhoGrowthChart student={report.student} history={records} metric="weight" />
                <Text className="text-sm font-semibold">
                  {t('Lịch sử đo sức khỏe · {count} đợt', { count: records.length })}
                </Text>
              </>
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
            <StudentProfile report={report} parentView={parentView} teachers={teachers} />
          ) : (
            <ReportRecord section={section} record={item} />
          )
        }
      />
    </SafeAreaView>
  );
}

const wholeCount = (value) => (Number.isInteger(value) && value >= 0 ? value : null);

// Tóm tắt đầu mỗi tab như thẻ thống kê của web, lấy đúng số máy chủ trả trong báo cáo; trường nào
// thiếu thì bỏ phần đó, không tự đếm lại từ lịch sử.
function SectionSummary({ section, report }) {
  const t = useTranslation();
  const locale = useLocale();
  const data = report[section] || {};
  const number = (value, digits = 1) =>
    Number(value).toLocaleString(locale, { maximumFractionDigits: digits });
  let label = '';
  let value = '';
  if (section === 'health') {
    const total = wholeCount(data.totalChecks);
    const latest = data.latest;
    label = total === null ? t('Sức khỏe') : t('Sức khỏe ({count} đợt)', { count: total });
    value =
      latest && Number(latest.height) > 0 && Number(latest.weight) > 0
        ? `${number(latest.height)} cm · ${number(latest.weight)} kg`
        : t('Chưa có dữ liệu');
  } else if (section === 'attendance') {
    const total = wholeCount(data.totalDays);
    const present = wholeCount(data.presentCount);
    const rate = typeof data.attendanceRate === 'number' ? data.attendanceRate : null;
    label =
      total && rate !== null
        ? t('Chuyên cần ({rate}%)', { rate: number(rate, 2) })
        : t('Chuyên cần');
    value =
      total && present !== null
        ? t('{present}/{total} buổi có mặt', { present, total })
        : t('Chưa có dữ liệu');
  } else if (section === 'assessments') {
    const total = wholeCount(data.totalAssessed);
    const achieved = wholeCount(data.achievedCount);
    const outstanding = wholeCount(data.outstandingCount);
    const notAchieved = wholeCount(data.notAchievedCount);
    label = total === null ? t('Đánh giá') : t('Đánh giá ({count} tiết)', { count: total });
    value =
      achieved === null || outstanding === null
        ? t('Chưa có dữ liệu')
        : [
            t('{count} Đạt', { count: achieved }),
            t('{count} Vượt trội', { count: outstanding }),
            notAchieved ? t('{count} Chưa đạt', { count: notAchieved }) : '',
          ]
            .filter(Boolean)
            .join(' · ');
  } else if (section === 'authorizations') {
    const total = wholeCount(data.total);
    const approved = wholeCount(data.approvedCount);
    const pending = wholeCount(data.pendingCount);
    label = total === null ? t('Ủy quyền') : t('Ủy quyền ({count} đơn)', { count: total });
    value =
      approved === null
        ? t('Chưa có dữ liệu')
        : [
            t('{count} Đã duyệt', { count: approved }),
            pending ? t('{count} Chờ duyệt', { count: pending }) : '',
          ]
            .filter(Boolean)
            .join(' · ');
  } else {
    return null;
  }
  return (
    <Card className="gap-1 px-4 py-3">
      <Text className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Text>
      <Text className="font-mono text-sm font-semibold">{value}</Text>
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
