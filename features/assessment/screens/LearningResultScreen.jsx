import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { ActionNotice } from '@/components/shared/ActionNotice';
import { useUnsavedChanges } from '@/components/shared/useUnsavedChanges';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { schoolToday } from '@/features/daily/utils/schedule-date';
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

function Option({ label, selected, disabled, onPress }) {
  return (
    <Button
      size="sm"
      variant={selected ? 'default' : 'outline'}
      disabled={disabled}
      accessibilityState={{ selected, disabled }}
      onPress={onPress}>
      <Text className="text-xs">{label}</Text>
    </Button>
  );
}

function Empty({ text }) {
  return (
    <Card className="p-4 shadow-none">
      <Text className="text-sm">{text}</Text>
    </Card>
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
  const discard = useUnsavedChanges(dirty, saving);
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
        <Card className="gap-1 p-3 shadow-none">
          <Text className="text-xs font-medium">{semesterRange}</Text>
          <Text className="text-xs text-muted-foreground">
            {calculatedUntil
              ? Number.isInteger(schoolDays)
                ? t('Tính đến {date} ({days} ngày)', { date: calculatedUntil, days: schoolDays })
                : t('Tính đến {date}', { date: calculatedUntil })
              : t(semesterDates.statusLabel || 'Chưa có mốc tính kết quả')}
          </Text>
        </Card>
      ) : null}
      {!monthly && !result.error ? (
        <View className="flex-row gap-2">
          {SEMESTERS.map(([value, label]) => (
            <Option
              key={value}
              label={t(label)}
              selected={semester === value}
              onPress={() => setSemester(value)}
            />
          ))}
        </View>
      ) : null}
      {monthly && data && !error && !monthNotEnded ? (
        <View className="flex-row flex-wrap gap-2">
          {Array.from(
            { length: Number.isInteger(weeks) && weeks >= 1 && weeks <= 6 ? weeks : 0 },
            (_, index) => index + 1
          ).map((value) => (
            <Option
              key={value}
              label={t('Tuần {week}', { week: value })}
              selected={shownWeek === value}
              onPress={() => setWeek(value)}
            />
          ))}
          <Option
            label={t('Tổng kết tháng')}
            selected={shownWeek === 0}
            onPress={() => setWeek(0)}
          />
          {rangeLabel ? (
            <Text className="w-full text-xs text-muted-foreground">{rangeLabel}</Text>
          ) : null}
        </View>
      ) : null}
      {data?.classInfo?.name && !error ? (
        <Text className="text-xs text-muted-foreground">
          {[data.classInfo.name, yearLabel].filter(Boolean).join(' · ')}
        </Text>
      ) : null}
      {!parent && data && !error ? (
        <Input
          value={search}
          onChangeText={setSearch}
          accessibilityLabel={t('Tìm học sinh')}
          placeholder={t('Tìm theo tên hoặc mã học sinh')}
          className="text-sm"
        />
      ) : null}
      {result.message ? (
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
      return <ActivityIndicator accessibilityLabel={t('Đang tải kết quả học tập')} />;
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
            record={{ ...data.record, weeklyStats: data.weeklyStats }}
            week={shownWeek}
            maxRoses={data.record?.maxRoses}
            parent
          />
        ) : (
          <Empty text={t('Chưa có phiếu đánh giá tháng này.')} />
        )}
        {data.record?.id && (shownWeek === 0 || feedback) ? (
          <Card className="gap-3 p-4 shadow-none">
            <Text className="text-sm font-semibold">{t('Phản hồi cho giáo viên')}</Text>
            <Text className="text-xs text-muted-foreground">{monthLabel(data.period, locale)}</Text>
            {feedback ? (
              <>
                <Textarea
                  value={feedback.value}
                  editable={!saving}
                  accessibilityLabel={t('Nội dung phản hồi')}
                  placeholder={t('Nhập nội dung phản hồi')}
                  className="text-sm"
                  onChangeText={(value) => setFeedback((current) => ({ ...current, value }))}
                />
                <View className="flex-row flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={saving || !dirty || !feedback.value.trim()}
                    onPress={submitFeedback}>
                    <Text>{t(saving ? 'Đang gửi…' : 'Gửi phản hồi')}</Text>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={saving}
                    onPress={() => discard(() => setFeedback(null))}>
                    <Text>{t('Đóng')}</Text>
                  </Button>
                </View>
              </>
            ) : (
              <>
                <Text className="text-xs leading-5">
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
              record={item}
              week={shownWeek}
              maxRoses={weeks}
            />
          ) : (
            <SemesterResultCard title={item.name} code={item.code} record={item} />
          )
        }
      />
    </View>
  );
}
