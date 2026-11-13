import { Stack, useLocalSearchParams } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { ActionNotice } from '@/components/shared/ActionNotice';
import { ChipTabs } from '@/components/shared/ChipTabs';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useActionToast } from '@/components/shared/useActionToast';
import { useUnsavedChanges } from '@/components/shared/useUnsavedChanges';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { schoolToday } from '@/features/daily/utils/schedule-date';
import { cn } from '@/lib/utils';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { MonthlyResultCard, SemesterResultCard } from '../components/ResultCards';
import { SchoolMonthPicker } from '../components/SchoolMonthPicker';
import { TeacherWebsiteNotice } from '../components/TeacherWebsiteNotice';
import { useLearningResults } from '../hooks/useLearningResults';
import { monthKey, monthLabel, resultDateLabel, schoolMonths } from '../utils/school-periods';

const SEMESTERS = [
  ['SEMESTER_1', 'Học kỳ 1'],
  ['SEMESTER_2', 'Học kỳ 2'],
];

function Empty({ text }) {
  return (
    <View className="items-center rounded-2xl border border-dashed border-border px-5 py-8">
      <Text className="text-center text-xs leading-5 text-muted-foreground">{text}</Text>
    </View>
  );
}

export default function LearningResultScreen() {
  const locale = useLocale();
  const t = useTranslation();
  const { kind } = useLocalSearchParams();
  const [period, setPeriod] = useState();
  const [semester, setSemester] = useState(SEMESTERS[0][0]);
  const [week, setWeek] = useState(0);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState(null);
  const monthly = kind === 'monthly';
  const result = useLearningResults({ kind, period, semester });
  // Lưu phản hồi thành công báo bằng toast; lỗi vẫn hiện trong form để đọc lại.
  useActionToast(result.message?.error ? null : result.message, t);
  const { parent, query, saving } = result;
  const data = query.data;
  const shownPeriod = parent ? data?.period : data?.classInfo;
  const schoolYear = data?.classInfo?.schoolYear || data?.classInfo?.academicYear;
  const selectedMonth = period || shownPeriod;
  const months = monthly ? schoolMonths(schoolYear, selectedMonth, schoolToday()) : [];
  const monthNotEnded =
    selectedMonth && months.some((month) => month.key === monthKey(selectedMonth) && !month.ended);
  const semesterDates = !monthly && !parent ? data?.classInfo?.semesterDates : null;
  const semesterStart = resultDateLabel(
    semesterDates?.startDate,
    semesterDates?.startDateVN,
    locale
  );
  const semesterEnd = resultDateLabel(semesterDates?.endDate, semesterDates?.endDateVN, locale);
  const semesterRange =
    locale === 'en-US' && semesterStart && semesterEnd
      ? `${semesterStart} – ${semesterEnd}`
      : semesterDates?.dateRangeLabel;
  const calculatedUntil = semesterDates
    ? resultDateLabel(data.classInfo.calculatedUntil, data.classInfo.calculatedUntilVN, locale)
    : null;
  const schoolDays = data?.classInfo?.totalSchoolDays;
  const weeks = monthly ? (parent ? data?.monthWeeks?.length : data?.classInfo?.totalWeeks) : 0;
  const shownWeek = week <= weeks ? week : 0;
  const queryText = search.trim().toLocaleLowerCase('vi');
  const semesterNotStarted = !monthly && !parent && data?.classInfo?.isStarted === false;
  const students =
    parent || semesterNotStarted || monthNotEnded
      ? []
      : (data?.students || []).filter((student) =>
          `${student.name || ''} ${student.code || ''}`.toLocaleLowerCase('vi').includes(queryText)
        );
  const semesterResult =
    !monthly && parent && data?.semesterAssessments?.find((item) => item.semester === semester);
  const dirty = feedback !== null && feedback.value.trim() !== feedback.original;
  const weekRanges = parent ? data?.weekRanges : data?.classInfo?.weekRanges;
  const rangeLabel = Array.isArray(weekRanges)
    ? weekRanges.find((item) => Number(item?.week) === shownWeek)?.rangeText
    : null;
  const unsaved = useUnsavedChanges(dirty, saving);
  const discard = unsaved.confirmDiscard;
  const selectMonth = (next) =>
    discard(() => {
      setFeedback(null);
      result.clearMessage();
      setWeek(0);
      setPeriod({ month: next.month, year: next.year });
    });

  async function submitFeedback() {
    if (await result.sendFeedback(feedback.value, feedback.original)) setFeedback(null);
  }

  const error =
    result.error ||
    (query.isError
      ? query.error?.isAxiosError
        ? 'Chưa tải được kết quả học tập. Vui lòng thử lại.'
        : query.error?.message
      : '');
  const title = t(monthly ? 'Sổ bé ngoan' : 'Kết quả học kỳ');
  const yearLabel =
    typeof schoolYear === 'string'
      ? schoolYear.replace(/^Năm học\s+(\d{4}\s*[-–—/]\s*\d{4})$/, (_, year) =>
          t('Năm học {year}', { year })
        )
      : schoolYear;
  const header = (
    <View className="gap-3">
      {!parent ? <TeacherWebsiteNotice kind={kind} /> : null}
      {months.length ? (
        <SchoolMonthPicker
          months={months}
          selected={selectedMonth}
          disabled={saving}
          onSelect={selectMonth}
        />
      ) : null}
      {semesterRange && !error ? (
        <Card className="gap-1 px-4 py-3">
          <Text className="font-mono text-xs font-medium">{semesterRange}</Text>
          <Text className="text-2xs text-muted-foreground">
            {calculatedUntil
              ? Number.isInteger(schoolDays)
                ? t('Tính đến {date} ({days} ngày)', { date: calculatedUntil, days: schoolDays })
                : t('Tính đến {date}', { date: calculatedUntil })
              : t(semesterDates.statusLabel || 'Chưa có mốc tính kết quả')}
          </Text>
        </Card>
      ) : null}
      {!monthly && !result.error ? (
        <Tabs value={semester} onValueChange={setSemester}>
          <TabsList className="w-full">
            {SEMESTERS.map(([value, label]) => (
              <TabsTrigger key={value} value={value} className="flex-1">
                <Text>{t(label)}</Text>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : null}
      {monthly && data && !error && !monthNotEnded ? (
        <View className="gap-2">
          <ChipTabs
            options={[
              ...Array.from(
                { length: Number.isInteger(weeks) && weeks >= 1 && weeks <= 6 ? weeks : 0 },
                (_, index) => ({ value: index + 1, label: t('Tuần {week}', { week: index + 1 }) })
              ),
              { value: 0, label: t('Tổng kết tháng') },
            ]}
            value={shownWeek}
            onChange={setWeek}
          />
          {rangeLabel ? (
            <Text className="font-mono text-2xs text-muted-foreground">{rangeLabel}</Text>
          ) : null}
        </View>
      ) : null}
      {data?.classInfo?.name && !error ? (
        <Text className="text-2xs text-muted-foreground">
          {[data.classInfo.name, yearLabel].filter(Boolean).join(' · ')}
        </Text>
      ) : null}
      {!parent && data && !error ? (
        <View className="justify-center">
          <Input
            value={search}
            onChangeText={setSearch}
            accessibilityLabel={t('Tìm học sinh')}
            placeholder={t('Tìm theo tên hoặc mã học sinh')}
            className="pl-9"
          />
          <View pointerEvents="none" className="absolute left-3">
            <Icon as={Search} size={16} className="text-muted-foreground" />
          </View>
        </View>
      ) : null}
      {result.message?.error ? (
        <ActionNotice message={{ ...result.message, text: t(result.message.text) }} />
      ) : null}
    </View>
  );

  const renderEmpty = () => {
    if (error)
      return (
        <View className="gap-3">
          <ActionNotice message={{ error: true, text: t(error) }} />
          {!result.error ? (
            <Button size="sm" variant="outline" onPress={() => query.refetch()}>
              <Text>{t('Thử lại')}</Text>
            </Button>
          ) : null}
        </View>
      );
    if (query.isPending)
      return (
        <ActivityIndicator className="py-10" accessibilityLabel={t('Đang tải kết quả học tập')} />
      );
    if (monthNotEnded)
      return <Empty text={t('Kết quả tháng sẽ hiển thị sau khi tháng kết thúc.')} />;
    if (semesterNotStarted) return <Empty text={t('Học kỳ này chưa bắt đầu.')} />;
    if (!parent)
      return (
        <Empty
          text={t(queryText ? 'Không tìm thấy học sinh phù hợp.' : 'Chưa có kết quả cho lớp.')}
        />
      );
    if (!monthly)
      return semesterResult ? (
        <SemesterResultCard
          title={data.student.fullName}
          code={data.student.studentCode}
          avatarUrl={result.avatarOf(data.student.id)}
          record={semesterResult}
          parent
        />
      ) : (
        <Empty text={t('Chưa công bố kết quả.')} />
      );

    return (
      <View className="gap-3">
        {shownWeek || data.record?.id ? (
          <MonthlyResultCard
            title={data.student.fullName}
            code={data.student.studentCode}
            avatarUrl={result.avatarOf(data.student.id)}
            record={{ ...data.record, weeklyStats: data.weeklyStats }}
            week={shownWeek}
            maxRoses={data.record?.maxRoses}
            parent
          />
        ) : (
          <Empty text={t('Chưa có phiếu đánh giá tháng này.')} />
        )}
        {data.record?.id && (shownWeek === 0 || feedback) ? (
          <Card className="gap-3 px-4 py-3.5">
            <View className="flex-row items-center justify-between gap-2">
              <Text className="text-sm font-semibold">{t('Phản hồi cho giáo viên')}</Text>
              <Text className="font-mono text-2xs text-muted-foreground">
                {monthLabel(data.period, locale)}
              </Text>
            </View>
            {feedback ? (
              <>
                <Textarea
                  value={feedback.value}
                  editable={!saving}
                  accessibilityLabel={t('Nội dung phản hồi')}
                  placeholder={t('Nhập nội dung phản hồi')}
                  onChangeText={(value) => setFeedback((current) => ({ ...current, value }))}
                />
                <View className="flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    disabled={saving}
                    onPress={() => discard(() => setFeedback(null))}>
                    <Text>{t('Đóng')}</Text>
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={saving || !dirty || !feedback.value.trim()}
                    onPress={submitFeedback}>
                    <Text>{t(saving ? 'Đang gửi…' : 'Gửi phản hồi')}</Text>
                  </Button>
                </View>
              </>
            ) : (
              <>
                <Text
                  className={cn(
                    'text-xs leading-5',
                    !data.record.parentFeedback && 'text-muted-foreground'
                  )}>
                  {data.record.parentFeedback || t('Chưa có phản hồi.')}
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => {
                    result.clearMessage();
                    const original = data.record.parentFeedback || '';
                    setFeedback({ original, value: original });
                  }}>
                  <Text>{t(data.record.parentFeedback ? 'Sửa phản hồi' : 'Viết phản hồi')}</Text>
                </Button>
              </>
            )}
          </Card>
        ) : null}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title }} />
      <FlatList
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-xl gap-3 p-4 pb-8"
        data={error ? [] : students}
        keyExtractor={(student) => String(student.id)}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        ListHeaderComponent={header}
        ListEmptyComponent={renderEmpty()}
        refreshing={query.isRefetching && !saving}
        onRefresh={!result.error && !saving ? () => query.refetch() : undefined}
        renderItem={({ item }) =>
          monthly ? (
            <MonthlyResultCard
              title={item.name}
              code={item.code}
              avatarUrl={result.avatarOf(item.id)}
              record={item}
              week={shownWeek}
              maxRoses={weeks}
            />
          ) : (
            <SemesterResultCard
              title={item.name}
              code={item.code}
              avatarUrl={result.avatarOf(item.id)}
              record={item}
            />
          )
        }
      />
      <ConfirmDialog {...unsaved.dialog} />
    </View>
  );
}
