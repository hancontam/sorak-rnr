import {
  ActivityStudentRatingCard,
  Button,
  Card,
  Icon,
  Input,
  Text,
  ThemedSpinner,
} from '@/components/ui';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useActivityAssessment } from '@/features/daily/hooks/useActivityAssessment';
import { ACTIVITY_RATINGS } from '@/features/daily/lib/activity-assessment';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { CalendarCheck, ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DOMAIN_LABELS = {
  PHYSICAL: 'Phát triển thể chất',
  COGNITIVE: 'Phát triển nhận thức',
  LANGUAGE: 'Phát triển ngôn ngữ',
  SOCIO_EMOTIONAL: 'Phát triển tình cảm và kỹ năng xã hội',
  AESTHETIC: 'Phát triển thẩm mỹ',
};
const ROUTINE_LABELS = {
  ARRIVAL_PLAY: 'Đón trẻ, chơi tự chọn',
  MORNING_EXERCISE: 'Thể dục sáng',
  DIRECTED_STUDY: 'Hoạt động học',
  CORNER_PLAY: 'Chơi, hoạt động ở các góc',
  OUTDOOR_PLAY: 'Chơi ngoài trời',
  AFTERNOON_ACTIVITY: 'Hoạt động chiều',
  RETURN_CHILD: 'Vệ sinh, trả trẻ',
};

function ContentField({ label, value }) {
  return (
    <View className="gap-0.5">
      <Text className="text-[10px] font-medium text-muted-foreground">{label}</Text>
      <Text className="text-xs leading-[17px]">{value || 'Chưa có thông tin'}</Text>
    </View>
  );
}

export default function ActivityAssessmentScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { slotId, date } = useLocalSearchParams();
  const user = useAuthStore((state) => state.user);
  const classId =
    user?.assignedClasses?.[0]?.classId || user?.teacher?.assignedClasses?.[0]?.classId;
  const [tab, setTab] = useState('content');
  const [search, setSearch] = useState('');
  const model = useActivityAssessment({
    classId,
    slotId: String(slotId || ''),
    date: String(date || ''),
  });
  const { slot, students } = model;
  const criteria = slot?.criteria || {};
  const future = String(date) > new Date().toLocaleDateString('sv-SE');
  usePreventRemove(model.hasEdits || model.save.isPending, ({ data }) => {
    if (model.save.isPending) return;
    Alert.alert('Bỏ thay đổi?', 'Đánh giá chưa lưu sẽ bị bỏ.', [
      { text: 'Ở lại', style: 'cancel' },
      {
        text: 'Bỏ thay đổi',
        style: 'destructive',
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });
  async function save() {
    try {
      await model.save.mutateAsync();
      Alert.alert('Đã lưu', 'Đánh giá hoạt động đã được lưu.');
    } catch (error) {
      Alert.alert(
        'Chưa lưu được',
        error.response?.status >= 500
          ? 'Máy chủ đang gặp lỗi. Đánh giá của bạn vẫn được giữ trên màn hình.'
          : error.response?.data?.message || error.message
      );
    }
  }
  const query = search.trim().toLocaleLowerCase('vi');
  const filtered = students.filter((student) =>
    `${student.name} ${student.code}`.toLocaleLowerCase('vi').includes(query)
  );
  const education = [
    ['Mục đích yêu cầu', criteria.objective || slot?.objective],
    ['Chuẩn bị', criteria.preparation || slot?.preparation],
    ['Tổ chức hoạt động', criteria.procedure || slot?.procedure],
    ['Đánh giá dự kiến', criteria.expectedAssessment || slot?.evaluationCriteria],
  ];
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="gap-3 px-6 pt-2">
          <View className="h-10 flex-row items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onPress={() => router.back()}
              accessibilityLabel="Quay lại">
              <Icon as={ChevronLeft} size={24} />
            </Button>
            <View className="h-10 flex-row items-center gap-3 rounded-md bg-secondary px-4">
              <Icon as={CalendarCheck} size={16} />
              <Text className="text-sm font-medium">Đánh giá mục tiêu</Text>
            </View>
          </View>
          <Text className="text-base font-semibold">{slot?.title || 'Hoạt động giáo dục'}</Text>
          <View className="flex-row items-center gap-4">
            <Text className="text-xs">
              {String(date || '')
                .split('-')
                .reverse()
                .join('/')}
            </Text>
            {slot ? (
              <Text className="text-xs text-muted-foreground">
                Hoạt động {model.slots.indexOf(slot) + 1}/{model.slots.length}
              </Text>
            ) : null}
          </View>
          <View className="flex-row gap-2" accessibilityRole="tablist">
            {[
              ['content', 'Nội dung hoạt động'],
              ['rating', 'Đánh giá học sinh'],
            ].map(([value, label]) => (
              <Button
                key={value}
                variant="ghost"
                className="h-10 flex-1 px-1"
                role="tab"
                accessibilityState={{ selected: tab === value }}
                onPress={() => setTab(value)}>
                <View
                  pointerEvents="none"
                  className="absolute inset-0 rounded-md bg-background shadow-sm shadow-black/5"
                  style={{ opacity: tab === value ? 1 : 0 }}
                />
                <Text
                  className={
                    tab === value
                      ? 'text-[13px] text-foreground'
                      : 'text-[13px] text-muted-foreground'
                  }>
                  {label}
                </Text>
              </Button>
            ))}
          </View>
        </View>
        {model.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ThemedSpinner />
          </View>
        ) : model.error || !slot ? (
          <View className="flex-1 justify-center gap-3 px-6">
            <Text className="text-center">
              {model.error?.response?.data?.message ||
                model.error?.message ||
                'Không tìm thấy hoạt động trong ngày đã chọn.'}
            </Text>
            <Button variant="outline" onPress={model.retry}>
              <Text>Thử lại</Text>
            </Button>
          </View>
        ) : (
          <>
            {tab === 'rating' ? (
              <View className="gap-3 px-6 pt-3">
                <View className="flex-row gap-4">
                  {ACTIVITY_RATINGS.map((rating) => (
                    <Text key={rating.value} className="text-[10px] text-muted-foreground">
                      ○ {rating.label}
                    </Text>
                  ))}
                </View>
                <Input
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Tìm học sinh…"
                  accessibilityLabel="Tìm học sinh"
                />
              </View>
            ) : null}
            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: 12,
                paddingBottom: 16,
                gap: 12,
              }}
              keyboardShouldPersistTaps="handled">
              {tab === 'content' ? (
                <>
                  <Text className="text-xs text-muted-foreground">
                    Tiêu chí từ kế hoạch giáo dục
                  </Text>
                  <Card className="gap-2 p-3 shadow-none">
                    <ContentField
                      label="Loại hoạt động"
                      value={ROUTINE_LABELS[slot.routineSlot] || slot.routineSlot}
                    />
                    <ContentField
                      label="Lĩnh vực"
                      value={
                        DOMAIN_LABELS[criteria.domain || slot.domain] ||
                        criteria.domain ||
                        slot.domain
                      }
                    />
                    <ContentField
                      label="Mục tiêu"
                      value={
                        criteria.goal || [slot.goalCode, slot.goalTitle].filter(Boolean).join(' · ')
                      }
                    />
                    <ContentField
                      label="Chỉ số Bộ Giáo dục"
                      value={criteria.indicatorCode || slot.indicatorCode}
                    />
                    <ContentField label="Nội dung" value={criteria.content || slot.contentTitle} />
                  </Card>
                  <Text className="text-xs text-muted-foreground">Nội dung hoạt động giáo dục</Text>
                  {education.map(([label, value]) => (
                    <Card key={label} className="gap-0 p-3 shadow-none">
                      <ContentField label={label} value={value} />
                    </Card>
                  ))}
                </>
              ) : filtered.length ? (
                filtered.map((student) => (
                  <ActivityStudentRatingCard
                    key={student.id}
                    student={student}
                    disabled={model.save.isPending || future}
                    onChange={(patch) => model.update(student.id, patch)}
                  />
                ))
              ) : (
                <Text className="py-8 text-center text-sm text-muted-foreground">
                  Không tìm thấy học sinh.
                </Text>
              )}
            </ScrollView>
          </>
        )}
        <View className="gap-2 bg-background px-6 pb-3 pt-2">
          {tab === 'rating' && model.ready ? (
            <Text className="text-xs text-muted-foreground">
              {future
                ? 'Chưa thể đánh giá ngày tương lai.'
                : model.changedCount
                  ? `${model.changedCount} học sinh chờ lưu · Đạt là mức đề xuất cho dòng chưa đánh giá`
                  : `Đã lưu đánh giá ${students.filter((student) => student.saved).length}/${students.length} học sinh`}
            </Text>
          ) : null}
          <View className="flex-row gap-2">
            <Button
              variant="outline"
              className="w-28"
              disabled={model.save.isPending}
              onPress={() => router.back()}>
              <Text>{tab === 'content' ? 'Đóng' : 'Hủy'}</Text>
            </Button>
            <Button
              className="flex-1"
              disabled={
                !model.ready ||
                (tab === 'rating' && (future || !model.changedCount || model.save.isPending))
              }
              onPress={tab === 'content' ? () => setTab('rating') : save}>
              {model.save.isPending ? (
                <ThemedSpinner />
              ) : (
                <Text>{tab === 'content' ? 'Đánh giá học sinh' : 'Lưu đánh giá'}</Text>
              )}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
