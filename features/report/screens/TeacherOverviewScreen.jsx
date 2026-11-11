import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ChevronRight, Search, School } from 'lucide-react-native';
import { FlatList, Pressable, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { ReportState } from '../components/ReportState';
import { StudentSummary } from '../components/StudentSummary';
import { useClassStudents } from '../hooks/useClassStudents';
import { formatDate, formatGender, reportError, schoolYearValue } from '../utils/report-format';

function searchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export default function TeacherOverviewScreen() {
  const t = useTranslation();
  const locale = useLocale();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { assignment, query } = useClassStudents();
  const students = useMemo(
    () =>
      (query.data?.students || []).filter((s) =>
        searchText(`${s.fullName} ${s.studentCode}`).includes(searchText(search.trim()))
      ),
    [query.data, search]
  );
  if (assignment.error || !assignment.classId)
    return (
      <View className="flex-1 bg-background p-4">
        <ReportState
          error={assignment.error}
          title="Chưa được phân công lớp"
          description="Bạn vẫn có thể xem hồ sơ và cài đặt từ tài khoản ở trên. Nhà trường sẽ cập nhật lớp phụ trách của bạn."
        />
      </View>
    );
  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={students}
        keyExtractor={(student) => String(student.id)}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-xl gap-3 p-4 pb-8"
        refreshing={query.isRefetching}
        onRefresh={query.refetch}
        ListHeaderComponent={
          <View className="gap-4 pb-1">
            <View className="gap-1">
              <Text className="text-xl font-semibold">{t('Tổng quan lớp')}</Text>
              <Text className="text-xs text-muted-foreground">
                {t('Theo dõi hồ sơ và quá trình học của trẻ')}
              </Text>
            </View>
            {query.data ? (
              <Card className="gap-2 rounded-2xl bg-muted/40 p-3.5 shadow-none">
                <View className="flex-row items-center gap-2">
                  <Icon as={School} size={16} />
                  <Text className="text-sm font-semibold">{query.data.class.name}</Text>
                </View>
                <Text className="text-xs text-muted-foreground">
                  {t('{count} học sinh', { count: query.data.students.length })}
                  {query.data.class.academicYear
                    ? ` · ${t('Năm học {year}', {
                        year: schoolYearValue(query.data.class.academicYear),
                      })}`
                    : ''}
                </Text>
              </Card>
            ) : null}
            <View className="gap-2">
              <Text className="text-sm font-semibold">{t('Danh sách học sinh')}</Text>
              <View className="relative justify-center">
                <Input
                  value={search}
                  onChangeText={setSearch}
                  placeholder={t('Tìm tên hoặc mã học sinh…')}
                  accessibilityLabel={t('Tìm học sinh')}
                  autoCorrect={false}
                  className="h-[34px] rounded-xl pl-9 text-xs"
                />
                <View pointerEvents="none" className="absolute left-3">
                  <Icon as={Search} size={14} className="text-muted-foreground" />
                </View>
              </View>
            </View>
            {query.isError ? (
              <ReportState error={reportError(query.error)} onRetry={query.refetch} />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          query.isError ? null : (
            <ReportState
              loading={query.isPending}
              title={search.trim() ? 'Không tìm thấy học sinh' : 'Lớp chưa có học sinh'}
              description={
                search.trim()
                  ? 'Thử tìm bằng tên khác hoặc mã học sinh.'
                  : 'Danh sách sẽ hiện khi nhà trường phân học sinh vào lớp.'
              }
            />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Xem hồ sơ {name}', { name: item.fullName || t('Học sinh') })}
            onPress={() =>
              router.push({
                pathname: '/(teacher)/student/[studentId]',
                params: { studentId: item.id },
              })
            }>
            <Card className="gap-2 rounded-2xl p-3 shadow-none">
              <StudentSummary student={item} />
              <View className="flex-row items-center gap-2">
                <Text className="min-w-0 flex-1 text-[11px] leading-4 text-muted-foreground">
                  {t(formatGender(item.gender))} ·{' '}
                  {t('Sinh {date}', { date: t(formatDate(item.dateOfBirth, locale)) })}
                </Text>
                <Icon as={ChevronRight} size={14} className="text-muted-foreground" />
              </View>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}
