import { useRouter } from 'expo-router';
import { ChevronRight, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { HeroCard } from '../components/HeroCard';
import { ReportState } from '../components/ReportState';
import { useClassStudents } from '../hooks/useClassStudents';
import {
  formatDate,
  formatGender,
  reportError,
  schoolYearValue,
  studentStatus,
} from '../utils/report-format';

const CLASS_HERO = require('@/assets/images/hero-class.jpg');

function searchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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
  const year = query.data?.class.academicYear;
  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={students}
        keyExtractor={(student) => String(student.id)}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-xl px-4 pb-8 pt-4"
        refreshing={query.isRefetching}
        onRefresh={query.refetch}
        ListHeaderComponent={
          <View className="gap-4 pb-3">
            <View className="gap-0.5">
              <Text className="text-lg font-semibold tracking-tight">{t('Tổng quan lớp')}</Text>
              <Text className="text-xs text-muted-foreground">
                {t('Theo dõi hồ sơ và quá trình học của trẻ')}
              </Text>
            </View>
            {query.data ? (
              <HeroCard
                source={CLASS_HERO}
                tag={year ? t('Năm học {year}', { year: schoolYearValue(year) }) : null}
                title={query.data.class.name}
                subtitle={t('{count} học sinh', { count: query.data.students.length })}
              />
            ) : null}
            <View className="gap-2">
              <Text className="text-sm font-semibold">{t('Danh sách học sinh')}</Text>
              <View className="justify-center">
                <Input
                  value={search}
                  onChangeText={setSearch}
                  placeholder={t('Tìm tên hoặc mã học sinh…')}
                  accessibilityLabel={t('Tìm học sinh')}
                  autoCorrect={false}
                  className="pl-9"
                />
                <View pointerEvents="none" className="absolute left-3">
                  <Icon as={Search} size={16} className="text-muted-foreground" />
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
        renderItem={({ item, index }) => {
          const first = index === 0;
          const last = index === students.length - 1;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Xem hồ sơ {name}', { name: item.fullName || t('Học sinh') })}
              onPress={() =>
                router.push({
                  pathname: '/(teacher)/student/[studentId]',
                  params: { studentId: item.id },
                })
              }
              // Danh sách trong một Card: bo góc ở dòng đầu/cuối, đường kẻ mảnh giữa các dòng.
              className={cn(
                'min-h-16 flex-row items-center gap-3 border-x border-border bg-card px-4 py-3 active:bg-muted/60',
                first ? 'rounded-t-2xl border-t' : 'border-t',
                last && 'rounded-b-2xl border-b'
              )}>
              <AccountAvatar user={item} className="size-10" />
              <View className="min-w-0 flex-1 gap-0.5">
                <Text numberOfLines={1} className="text-sm font-semibold">
                  {item.fullName || t('Học sinh')}
                </Text>
                <Text numberOfLines={1} className="text-2xs text-muted-foreground">
                  <Text className="font-mono text-2xs text-muted-foreground">
                    {item.studentCode}
                  </Text>
                  {' · '}
                  {t(formatGender(item.gender))} · {t(formatDate(item.dateOfBirth, locale))}
                </Text>
              </View>
              <Badge variant="secondary">
                <Text>{t(item.statusLabel || studentStatus(item.status))}</Text>
              </Badge>
              <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
            </Pressable>
          );
        }}
      />
    </View>
  );
}
