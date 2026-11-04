import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ThemedSpinner } from '@/components/ui/themed-spinner';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { getDismissalOverview, saveDismissalRecords } from '@/features/daily/api/daily.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  UserCheck,
} from 'lucide-react-native';
import * as React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatDateDisplay(d) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatDateISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function formatCurrentTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function PickupRecordScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const assignedClass = user?.assignedClasses?.[0] || user?.teacher?.assignedClasses?.[0];
  const classId = assignedClass?.classId || 'default';
  const className = assignedClass?.className || 'Lớp của bạn';

  const [date, setDate] = React.useState(new Date());
  const [search, setSearch] = React.useState('');
  const [pickupState, setPickupState] = React.useState({});

  const dateStr = React.useMemo(() => formatDateISO(date), [date]);

  const { data: dismissalData, isLoading } = useQuery({
    queryKey: ['dismissal-overview', classId, dateStr],
    queryFn: () => getDismissalOverview(classId, { date: dateStr }),
  });

  const students = dismissalData?.students || [];

  React.useEffect(() => {
    if (students.length > 0) {
      setPickupState((prev) => {
        const next = { ...prev };
        students.forEach((st) => {
          if (!next[st.id]) {
            next[st.id] = {
              pickupPerson: st.pickupPerson || st.pickupPersonName || 'Phụ huynh',
              pickupTime: st.pickupTime || formatCurrentTime(),
              note: st.pickupNote || st.note || '',
              dismissed: Boolean(st.pickupTime || st.status === 'DISMISSED'),
            };
          }
        });
        return next;
      });
    }
  }, [students]);

  const setStudentPickupField = (studentId, field, value) => {
    setPickupState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const saveMutation = useMutation({
    mutationFn: (records) =>
      saveDismissalRecords(classId, {
        date: dateStr,
        records,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['dismissal-overview'] });
      queryClient.invalidateQueries({ queryKey: ['daily-timetable-teacher'] });
      Alert.alert(
        'Thành công',
        res?.message || 'Đã lưu ghi nhận đón trẻ thành công!',
        [{ text: 'Đóng', onPress: () => router.back() }]
      );
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Không thể lưu đón trẻ';
      Alert.alert('Lỗi', msg);
    },
  });

  const handleSave = () => {
    // Only students who are PRESENT in class can be dismissed
    const presentStudents = students.filter(
      (s) => s.attendanceStatus === 'PRESENT' || s.status !== 'ABSENT'
    );
    if (presentStudents.length === 0) {
      Alert.alert('Thông báo', 'Không có học sinh nào có mặt để đón');
      return;
    }

    const records = presentStudents.map((st) => {
      const entry = pickupState[st.id] || {};
      return {
        studentId: st.id,
        pickupPersonName: entry.pickupPerson || 'Phụ huynh',
        pickupTime: entry.pickupTime || formatCurrentTime(),
        pickupNote: entry.note || undefined,
        status: 'DISMISSED',
      };
    });

    saveMutation.mutate(records);
  };

  const filteredStudents = React.useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.code?.toLowerCase().includes(q)
    );
  }, [students, search]);

  const dismissedCount = students.filter(
    (s) => pickupState[s.id]?.dismissed || s.status === 'DISMISSED' || s.pickupTime
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        {/* Header */}
        <View className="h-14 flex-row items-center justify-between px-6">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            className="size-8 items-center justify-center rounded-md border border-border bg-background active:bg-accent/20">
            <Icon as={ChevronLeft} size={18} className="text-foreground" />
          </Pressable>

          <View className="h-9 flex-row items-center gap-2 rounded-md bg-secondary px-3">
            <Icon as={UserCheck} size={15} className="text-secondary-foreground" />
            <Text className="text-sm font-medium text-secondary-foreground">Đón trẻ</Text>
          </View>

          <View className="size-8" />
        </View>

        {/* Title & Class subtitle */}
        <View className="px-6 pb-2 pt-1">
          <Text className="text-lg font-semibold text-foreground">Ghi nhận đón trẻ</Text>
          <Text className="text-xs text-muted-foreground">
            {className} · {students.length} học sinh
          </Text>
        </View>

        {/* Date Controls */}
        <View className="flex-row items-center justify-between px-6 py-2">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => {
                const prev = new Date(date);
                prev.setDate(prev.getDate() - 1);
                setDate(prev);
              }}
              accessibilityRole="button"
              accessibilityLabel="Ngày trước"
              className="size-8 items-center justify-center rounded-md border border-border bg-background active:bg-accent/20">
              <Icon as={ChevronLeft} size={16} className="text-foreground" />
            </Pressable>

            <View className="h-9 flex-row items-center justify-between rounded-md border border-border bg-background px-3">
              <Text className="text-sm text-foreground">{formatDateDisplay(date)}</Text>
              <Icon as={ChevronDown} size={14} className="ml-2 text-muted-foreground" />
            </View>

            <Pressable
              onPress={() => {
                const next = new Date(date);
                next.setDate(next.getDate() + 1);
                setDate(next);
              }}
              accessibilityRole="button"
              accessibilityLabel="Ngày sau"
              className="size-8 items-center justify-center rounded-md border border-border bg-background active:bg-accent/20">
              <Icon as={ChevronRight} size={16} className="text-foreground" />
            </Pressable>
          </View>

          <Button
            variant="outline"
            size="sm"
            onPress={() => setDate(new Date())}
            className="h-9 px-3">
            <Text className="text-sm font-medium text-foreground">Hôm nay</Text>
          </Button>
        </View>

        {/* Subheader */}
        <View className="px-6 py-1">
          <Text className="text-sm font-semibold text-foreground">Giờ đón & người đón trẻ</Text>
          <Text className="text-[11px] text-muted-foreground">
            Chọn người đã cấu hình hoặc được uỷ quyền
          </Text>
        </View>

        {/* Search input */}
        <View className="px-6 py-2">
          <View className="h-10 flex-row items-center rounded-md border border-border bg-background px-3">
            <Icon as={Search} size={16} className="mr-2 text-muted-foreground" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm học sinh..."
              placeholderTextColor="#71717a"
              className="flex-1 text-sm text-foreground"
            />
          </View>
        </View>

        {/* Student list */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-10">
            <ThemedSpinner size="large" />
            <Text className="mt-2 text-xs text-muted-foreground">Đang tải danh sách đón trẻ...</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110, gap: 12 }}
            className="flex-1">
            {filteredStudents.length === 0 ? (
              <View className="items-center justify-center py-12">
                <Text className="text-sm text-muted-foreground">Không tìm thấy học sinh nào</Text>
              </View>
            ) : (
              filteredStudents.map((st) => {
                const entry = pickupState[st.id] || {};
                const isAbsent = st.attendanceStatus === 'EXCUSED_ABSENCE' || st.attendanceStatus === 'UNEXCUSED_ABSENCE';

                return (
                  <Card key={st.id} className="p-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <Avatar alt={st.name} className="size-8 rounded-lg">
                          <AvatarFallback>
                            <Text className="text-xs font-semibold">
                              {st.name.slice(0, 1).toUpperCase()}
                            </Text>
                          </AvatarFallback>
                        </Avatar>
                        <View>
                          <Text className="text-[13px] font-semibold text-foreground">
                            {st.name}
                          </Text>
                          <Text className="text-[11px] text-muted-foreground">{st.code}</Text>
                        </View>
                      </View>
                      <Badge
                        variant={isAbsent ? 'secondary' : 'default'}
                        className="px-2 py-0.5">
                        <Text
                          className={`text-xs font-medium ${
                            isAbsent
                              ? 'text-secondary-foreground'
                              : 'text-primary-foreground'
                          }`}>
                          {isAbsent ? 'Vắng' : 'Có'}
                        </Text>
                      </Badge>
                    </View>

                    {/* Pickup details */}
                    <View className="mt-3 flex-row gap-3">
                      <View className="flex-1">
                        <Text className="mb-1 text-[11px] font-medium text-muted-foreground">
                          Người đón
                        </Text>
                        <View className="h-8 rounded-md border border-border bg-background px-2.5 justify-center">
                          <TextInput
                            value={entry.pickupPerson}
                            onChangeText={(val) => setStudentPickupField(st.id, 'pickupPerson', val)}
                            placeholder="Người đón..."
                            placeholderTextColor="#71717a"
                            className="text-xs text-foreground"
                          />
                        </View>
                      </View>

                      <View className="w-24">
                        <Text className="mb-1 text-[11px] font-medium text-muted-foreground">
                          Giờ đón
                        </Text>
                        <View className="h-8 rounded-md border border-border bg-background px-2.5 justify-center">
                          <TextInput
                            value={entry.pickupTime}
                            onChangeText={(val) => setStudentPickupField(st.id, 'pickupTime', val)}
                            placeholder="16:30"
                            placeholderTextColor="#71717a"
                            className="text-xs text-foreground"
                          />
                        </View>
                      </View>
                    </View>

                    {/* Teacher note */}
                    <View className="mt-2.5">
                      <Text className="mb-1 text-[11px] font-medium text-muted-foreground">
                        Dặn dò phụ huynh
                      </Text>
                      <View className="h-8 rounded-md border border-border bg-background px-2.5 justify-center">
                        <TextInput
                          value={entry.note}
                          onChangeText={(val) => setStudentPickupField(st.id, 'note', val)}
                          placeholder="Dặn dò phụ huynh..."
                          placeholderTextColor="#71717a"
                          className="text-xs text-foreground"
                        />
                      </View>
                    </View>
                  </Card>
                );
              })
            )}
          </ScrollView>
        )}

        {/* Sticky footer */}
        <View className="border-t border-border bg-background px-6 py-3 shadow-lg shadow-black/5">
          <Text className="mb-2 text-xs font-medium text-primary">
            Đã đón trẻ ({dismissedCount}/{students.length})
          </Text>
          <View className="flex-row gap-2">
            <Button
              variant="outline"
              onPress={() => router.back()}
              className="w-28 h-10">
              <Text className="text-sm font-medium text-foreground">Hủy</Text>
            </Button>
            <Button
              disabled={saveMutation.isPending}
              onPress={handleSave}
              className="flex-1 h-10">
              {saveMutation.isPending ? (
                <ThemedSpinner size="small" />
              ) : (
                <Text className="text-sm font-medium text-primary-foreground">
                  Lưu đón trẻ
                </Text>
              )}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
