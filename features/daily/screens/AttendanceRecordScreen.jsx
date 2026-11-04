import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { ThemedSpinner } from '@/components/ui/themed-spinner';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { getTimetable, saveAttendanceRecords } from '@/features/daily/api/daily.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  CalendarCheck2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
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

export default function AttendanceRecordScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const assignedClass = user?.assignedClasses?.[0] || user?.teacher?.assignedClasses?.[0];
  const classId = assignedClass?.classId || 'default';
  const className = assignedClass?.className || 'Lớp của bạn';

  const [date, setDate] = React.useState(new Date());
  const [search, setSearch] = React.useState('');
  const [attendanceState, setAttendanceState] = React.useState({});

  const dateStr = React.useMemo(() => formatDateISO(date), [date]);

  const { data: timetableData, isLoading } = useQuery({
    queryKey: ['timetable-attendance', classId, dateStr],
    queryFn: () => getTimetable(classId, { date: dateStr }),
  });

  const students = timetableData?.students || [];

  // Initialize or update attendanceState when students data loads
  React.useEffect(() => {
    if (students.length > 0) {
      setAttendanceState((prev) => {
        const next = { ...prev };
        students.forEach((st) => {
          if (!next[st.id]) {
            next[st.id] = {
              status: st.rawStatus || st.status || 'PRESENT',
              note: st.notes || st.note || '',
            };
          }
        });
        return next;
      });
    }
  }, [students]);

  const setStudentStatus = (studentId, status) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const setStudentNote = (studentId, note) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
  };

  const saveMutation = useMutation({
    mutationFn: (records) =>
      saveAttendanceRecords(classId, {
        date: dateStr,
        records,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['timetable-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['daily-timetable-teacher'] });
      Alert.alert(
        'Thành công',
        res?.message || 'Đã lưu điểm danh thành công!',
        [{ text: 'Đóng', onPress: () => router.back() }]
      );
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Không thể lưu điểm danh';
      Alert.alert('Lỗi', msg);
    },
  });

  const handleSave = () => {
    const activeStudents = students.filter((s) => !s.isTransferred);
    const records = activeStudents.map((st) => {
      const entry = attendanceState[st.id] || {};
      return {
        studentId: st.id,
        status: entry.status || 'PRESENT',
        notes: entry.note || undefined,
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

  const activeStudents = students.filter((s) => !s.isTransferred);
  const unmarkedCount = activeStudents.filter((s) => !attendanceState[s.id]?.status).length;

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
            <Icon as={CalendarCheck2} size={15} className="text-secondary-foreground" />
            <Text className="text-sm font-medium text-secondary-foreground">Điểm danh</Text>
          </View>

          <View className="size-8" />
        </View>

        {/* Title & Class subtitle */}
        <View className="px-6 pb-2 pt-1">
          <Text className="text-lg font-semibold text-foreground">Ghi nhận điểm danh</Text>
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

        {/* Legend: Có / CP / KP */}
        <View className="flex-row items-center gap-4 px-6 py-1.5">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs font-semibold text-primary">Có</Text>
            <Text className="text-xs text-muted-foreground">Có mặt</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs font-semibold text-primary">CP</Text>
            <Text className="text-xs text-muted-foreground">Có phép</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs font-semibold text-primary">KP</Text>
            <Text className="text-xs text-muted-foreground">Không phép</Text>
          </View>
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
            <Text className="mt-2 text-xs text-muted-foreground">Đang tải danh sách học sinh...</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 110, gap: 10 }}
            className="flex-1">
            {filteredStudents.length === 0 ? (
              <View className="items-center justify-center py-12">
                <Text className="text-sm text-muted-foreground">Không tìm thấy học sinh nào</Text>
              </View>
            ) : (
              filteredStudents.map((st) => {
                const currentStatus = attendanceState[st.id]?.status || 'PRESENT';
                const currentNote = attendanceState[st.id]?.note || '';

                if (st.isTransferred) {
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
                        <Badge variant="secondary" className="px-2 py-0.5">
                          <Text className="text-[11px] text-secondary-foreground">
                            Đã chuyển lớp
                          </Text>
                        </Badge>
                      </View>
                      <View className="mt-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 opacity-60">
                        <Text className="text-xs text-muted-foreground">
                          Đã chuyển lớp khác · chỉ xem
                        </Text>
                      </View>
                    </Card>
                  );
                }

                return (
                  <Card key={st.id} className="p-3">
                    <View className="flex-row items-center gap-3">
                      <Avatar alt={st.name} className="size-8 rounded-lg">
                        <AvatarFallback>
                          <Text className="text-xs font-semibold">
                            {st.name.slice(0, 1).toUpperCase()}
                          </Text>
                        </AvatarFallback>
                      </Avatar>
                      <View className="flex-1">
                        <Text className="text-[13px] font-semibold text-foreground">
                          {st.name}
                        </Text>
                        <Text className="text-[11px] text-muted-foreground">{st.code}</Text>
                      </View>
                    </View>

                    {/* Status segmented buttons & Note */}
                    <View className="mt-3 flex-row items-center gap-2">
                      <View className="flex-row gap-1">
                        <Pressable
                          onPress={() => setStudentStatus(st.id, 'PRESENT')}
                          accessibilityRole="button"
                          accessibilityLabel="Có mặt"
                          className={`h-8 w-11 items-center justify-center rounded-md ${
                            currentStatus === 'PRESENT'
                              ? 'bg-primary'
                              : 'border border-border bg-background'
                          }`}>
                          <Text
                            className={`text-xs font-semibold ${
                              currentStatus === 'PRESENT'
                                ? 'text-primary-foreground'
                                : 'text-foreground'
                            }`}>
                            Có
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => setStudentStatus(st.id, 'EXCUSED_ABSENCE')}
                          accessibilityRole="button"
                          accessibilityLabel="Có phép"
                          className={`h-8 w-11 items-center justify-center rounded-md ${
                            currentStatus === 'EXCUSED_ABSENCE'
                              ? 'bg-primary'
                              : 'border border-border bg-background'
                          }`}>
                          <Text
                            className={`text-xs font-semibold ${
                              currentStatus === 'EXCUSED_ABSENCE'
                                ? 'text-primary-foreground'
                                : 'text-foreground'
                            }`}>
                            CP
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => setStudentStatus(st.id, 'UNEXCUSED_ABSENCE')}
                          accessibilityRole="button"
                          accessibilityLabel="Không phép"
                          className={`h-8 w-11 items-center justify-center rounded-md ${
                            currentStatus === 'UNEXCUSED_ABSENCE'
                              ? 'bg-primary'
                              : 'border border-border bg-background'
                          }`}>
                          <Text
                            className={`text-xs font-semibold ${
                              currentStatus === 'UNEXCUSED_ABSENCE'
                                ? 'text-primary-foreground'
                                : 'text-foreground'
                            }`}>
                            KP
                          </Text>
                        </Pressable>
                      </View>

                      <View className="h-8 flex-1 rounded-md border border-border bg-background px-2.5">
                        <TextInput
                          value={currentNote}
                          onChangeText={(text) => setStudentNote(st.id, text)}
                          placeholder="Ghi chú..."
                          placeholderTextColor="#71717a"
                          className="h-full text-xs text-foreground"
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
          <Text className="mb-2 text-xs font-medium text-muted-foreground">
            {unmarkedCount} học sinh chưa điểm danh
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
                  Lưu điểm danh
                </Text>
              )}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
