import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  cancelParentRequest,
  createParentRequest,
  getParentRequests,
} from '@/features/request/api/request.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Plus,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ParentRequestScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'

  // Form states
  const [pickupPersonName, setPickupPersonName] = useState('');
  const [pickupPersonPhone, setPickupPersonPhone] = useState('');
  const [relationship, setRelationship] = useState('Cậu');
  const [pickupCitizenId, setPickupCitizenId] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { data: requestData, isLoading: loadingRequests } = useQuery({
    queryKey: ['parent-requests'],
    queryFn: getParentRequests,
  });

  const createMutation = useMutation({
    mutationFn: createParentRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-requests'] });
      setSuccessMessage('Đã gửi đơn ủy thác thành công! Giáo viên sẽ đối chiếu khi đón trẻ.');
      setPickupPersonName('');
      setPickupPersonPhone('');
      setPickupCitizenId('');
      setNote('');
      setFormError('');
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || err.message || 'Gửi đơn thất bại.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelParentRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-requests'] });
    },
    onError: (err) => {
      Alert.alert('Không thể hủy đơn', err.response?.data?.message || err.message);
    },
  });

  const studentName =
    requestData?.student?.fullName || user?.student?.fullName || 'Học sinh';
  const requests = requestData?.requests || [];

  const handleSubmit = () => {
    setFormError('');
    setSuccessMessage('');

    if (!pickupPersonName.trim()) {
      setFormError('Vui lòng nhập họ và tên người được ủy thác.');
      return;
    }
    if (!pickupPersonPhone.trim()) {
      setFormError('Vui lòng nhập số điện thoại người đón.');
      return;
    }
    if (!relationship.trim()) {
      setFormError('Vui lòng nhập mối quan hệ với bé.');
      return;
    }
    if (!startDate || !endDate) {
      setFormError('Vui lòng chọn thời gian bắt đầu và kết thúc.');
      return;
    }

    createMutation.mutate({
      pickup_person_name: pickupPersonName.trim(),
      pickup_person_phone: pickupPersonPhone.trim(),
      relationship: relationship.trim(),
      pickup_citizen_id: pickupCitizenId.trim() || undefined,
      start_date: startDate,
      end_date: endDate,
      note: note.trim() || undefined,
    });
  };

  const handleCancel = (requestId) => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn hủy đơn ủy thác này?', [
      { text: 'Bỏ qua', style: 'cancel' },
      {
        text: 'Hủy đơn',
        style: 'destructive',
        onPress: () => cancelMutation.mutate(requestId),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="h-14 flex-row items-center gap-3 px-6">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          className="size-9 items-center justify-center rounded-lg border border-border bg-background">
          <Icon as={ChevronLeft} size={20} strokeWidth={2} className="text-foreground" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            Gửi yêu cầu đón hộ / ủy thác
          </Text>
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            Ủy thác người đón · {studentName}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row items-center border-b border-border px-6">
        <Pressable
          onPress={() => {
            setActiveTab('create');
            setSuccessMessage('');
          }}
          className={`flex-row items-center gap-1.5 border-b-2 py-3 mr-6 ${
            activeTab === 'create' ? 'border-primary' : 'border-transparent'
          }`}>
          <Icon
            as={Plus}
            size={16}
            strokeWidth={2}
            className={activeTab === 'create' ? 'text-primary' : 'text-muted-foreground'}
          />
          <Text
            className={`text-sm font-medium ${
              activeTab === 'create' ? 'text-foreground' : 'text-muted-foreground'
            }`}>
            Tạo đơn mới
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('history')}
          className={`flex-row items-center gap-1.5 border-b-2 py-3 ${
            activeTab === 'history' ? 'border-primary' : 'border-transparent'
          }`}>
          <Icon
            as={Clock}
            size={16}
            strokeWidth={2}
            className={activeTab === 'history' ? 'text-primary' : 'text-muted-foreground'}
          />
          <Text
            className={`text-sm font-medium ${
              activeTab === 'history' ? 'text-foreground' : 'text-muted-foreground'
            }`}>
            Lịch sử đơn ({requests.length})
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        {activeTab === 'create' ? (
          <ScrollView
            className="flex-1 px-6 pt-4"
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled">
            {/* Notice Alert Card */}
            <View className="flex-row items-start gap-3 rounded-lg border border-border bg-card p-4">
              <Icon as={ShieldCheck} size={20} strokeWidth={2} className="mt-0.5 text-primary" />
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground">
                  Xác minh người đón
                </Text>
                <Text className="mt-1 text-xs text-muted-foreground leading-4">
                  Giáo viên sẽ đối chiếu số điện thoại, CCCD và thông tin ủy thác khi bàn giao bé tại lớp.
                </Text>
              </View>
            </View>

            {successMessage ? (
              <View className="mt-4 flex-row items-center gap-2 rounded-lg bg-emerald-500/10 p-3 border border-emerald-500/20">
                <Icon as={CheckCircle2} size={18} strokeWidth={2} className="text-emerald-600" />
                <Text className="flex-1 text-xs font-medium text-emerald-700">
                  {successMessage}
                </Text>
              </View>
            ) : null}

            {formError ? (
              <View className="mt-4 flex-row items-center gap-2 rounded-lg bg-destructive/10 p-3 border border-destructive/20">
                <Icon as={XCircle} size={18} strokeWidth={2} className="text-destructive" />
                <Text className="flex-1 text-xs font-medium text-destructive">
                  {formError}
                </Text>
              </View>
            ) : null}

            {/* Input fields */}
            <View className="mt-5 flex-col gap-4">
              <View>
                <Text className="text-xs font-medium text-foreground">
                  Họ và tên người được ủy thác *
                </Text>
                <Input
                  value={pickupPersonName}
                  onChangeText={setPickupPersonName}
                  placeholder="Ví dụ: Nguyễn Văn Nam"
                  className="mt-1.5 h-10 rounded-md border-border bg-background px-3 text-sm shadow-none"
                />
              </View>

              <View>
                <Text className="text-xs font-medium text-foreground">
                  Số điện thoại liên hệ *
                </Text>
                <Input
                  value={pickupPersonPhone}
                  onChangeText={setPickupPersonPhone}
                  placeholder="0912 345 678"
                  keyboardType="phone-pad"
                  className="mt-1.5 h-10 rounded-md border-border bg-background px-3 text-sm shadow-none"
                />
              </View>

              <View>
                <Text className="text-xs font-medium text-foreground">
                  Mối quan hệ với bé *
                </Text>
                <Input
                  value={relationship}
                  onChangeText={setRelationship}
                  placeholder="Ví dụ: Cậu, Dì, Bác, Ông bà..."
                  className="mt-1.5 h-10 rounded-md border-border bg-background px-3 text-sm shadow-none"
                />
              </View>

              <View>
                <Text className="text-xs font-medium text-foreground">
                  Số CCCD / CMND người đón
                </Text>
                <Input
                  value={pickupCitizenId}
                  onChangeText={setPickupCitizenId}
                  placeholder="12 chữ số trên căn cước (nếu có)"
                  keyboardType="numeric"
                  className="mt-1.5 h-10 rounded-md border-border bg-background px-3 text-sm shadow-none"
                />
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-medium text-foreground">
                    Từ ngày (YYYY-MM-DD) *
                  </Text>
                  <Input
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="2026-10-30"
                    className="mt-1.5 h-10 rounded-md border-border bg-background px-3 text-sm shadow-none"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium text-foreground">
                    Đến ngày (YYYY-MM-DD) *
                  </Text>
                  <Input
                    value={endDate}
                    onChangeText={setEndDate}
                    placeholder="2026-10-30"
                    className="mt-1.5 h-10 rounded-md border-border bg-background px-3 text-sm shadow-none"
                  />
                </View>
              </View>

              <View>
                <Text className="text-xs font-medium text-foreground">
                  Ghi chú cho giáo viên / lý do đón hộ hoặc xin nghỉ
                </Text>
                <Textarea
                  value={note}
                  onChangeText={setNote}
                  placeholder="Ví dụ: Đón bé lúc 16:30 bằng xe máy / bé xin phép về quê cùng gia đình..."
                  className="mt-1.5 min-h-[72px] rounded-md border-border bg-background p-3 text-sm shadow-none"
                />
              </View>
            </View>

            {/* Submit buttons */}
            <View className="mt-6 flex-row items-center gap-3">
              <Button
                variant="outline"
                onPress={() => router.back()}
                className="h-10 px-5 rounded-md">
                <Text className="text-sm font-medium text-foreground">Hủy</Text>
              </Button>

              <Button
                onPress={handleSubmit}
                disabled={createMutation.isPending}
                className="h-10 flex-1 rounded-md bg-primary">
                {createMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-sm font-medium text-primary-foreground">
                    Gửi đơn ủy thác
                  </Text>
                )}
              </Button>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            className="flex-1 px-6 pt-4"
            contentContainerStyle={{ paddingBottom: 40 }}>
            {loadingRequests ? (
              <View className="mt-20 items-center justify-center">
                <ActivityIndicator size="large" className="text-primary" />
              </View>
            ) : requests.length === 0 ? (
              <View className="mt-20 items-center justify-center px-4">
                <View className="size-16 items-center justify-center rounded-full bg-secondary">
                  <Icon as={UserCheck} size={28} strokeWidth={2} className="text-muted-foreground" />
                </View>
                <Text className="mt-4 text-center text-base font-medium text-foreground">
                  Chưa có đơn ủy thác nào
                </Text>
                <Text className="mt-1 text-center text-sm text-muted-foreground">
                  Các đơn bạn gửi sẽ hiển thị trạng thái duyệt tại đây.
                </Text>
              </View>
            ) : (
              <View className="flex-col gap-3">
                {requests.map((req) => (
                  <Card key={req.id} className="rounded-xl border border-border bg-card p-4 shadow-none">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">
                          {req.pickup_person_name || req.pickupPersonName}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          {req.relationship} · {req.pickup_person_phone || req.pickupPersonPhone}
                        </Text>
                      </View>
                      <Badge
                        variant={
                          req.status === 'APPROVED'
                            ? 'default'
                            : req.status === 'REJECTED'
                            ? 'destructive'
                            : 'secondary'
                        }>
                        <Text className="text-[11px] font-medium">
                          {req.status === 'APPROVED'
                            ? 'Đã duyệt'
                            : req.status === 'REJECTED'
                            ? 'Đã từ chối'
                            : req.status === 'CANCELLED'
                            ? 'Đã hủy'
                            : 'Chờ duyệt'}
                        </Text>
                      </Badge>
                    </View>

                    <View className="mt-3 border-t border-border pt-2">
                      <Text className="text-xs text-muted-foreground">
                        Hiệu lực: {req.start_date || req.startDate} – {req.end_date || req.endDate}
                      </Text>
                      {req.note ? (
                        <Text className="mt-1 text-xs text-foreground italic">
                          "{req.note}"
                        </Text>
                      ) : null}
                    </View>

                    {req.status === 'PENDING' ? (
                      <View className="mt-3 flex-row justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onPress={() => handleCancel(req.id)}
                          disabled={cancelMutation.isPending}
                          className="h-8 px-3 rounded-md">
                          <Text className="text-xs font-medium text-destructive-foreground">
                            Hủy đơn
                          </Text>
                        </Button>
                      </View>
                    ) : null}
                  </Card>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
