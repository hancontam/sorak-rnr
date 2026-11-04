import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SorakMark from '@/assets/images/sorak-mark.svg';
import { HomeBottomNav, HomeSectionTabs, Icon, Text } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store/auth.store';
import ParentAssessmentMenuScreen from '@/features/assessment/screens/ParentAssessmentMenuScreen';
import TeacherAssessmentMenuScreen from '@/features/assessment/screens/TeacherAssessmentMenuScreen';
import DailyTimetableScreen from '@/features/daily/screens/DailyTimetableScreen';
import { getNotifications } from '@/features/notification/api/notification.api';
import {
  getParentRequests,
  getTeacherAuthorizations,
} from '@/features/request/api/request.api';
import ParentReportScreen from '@/features/report/screens/ParentReportScreen';
import ReportListScreen from '@/features/report/screens/ReportListScreen';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const [activeTabIndex, setActiveTabIndex] = useState(1);
  const [studentSearch, setStudentSearch] = useState('');
  const user = useAuthStore((state) => state.user);
  const name = user?.fullName || user?.name || user?.username || 'Sorak';
  const username = user?.username || user?.employeeCode || name;
  const avatar = user?.avatar || user?.avatarUrl;
  const isParent = user?.role === 'PARENT_PH';
  const assignedClass = user?.assignedClasses?.[0] || user?.teacher?.assignedClasses?.[0];
  const classId = assignedClass?.classId;
  const className =
    (isParent ? user?.student?.className : assignedClass?.className) || 'Chưa có lớp';

  const { data: notificationData } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const { data: teacherAuthData } = useQuery({
    queryKey: ['teacher-authorizations', classId],
    queryFn: () => getTeacherAuthorizations(classId),
    enabled: !isParent && !!classId,
  });

  const { data: parentRequestData } = useQuery({
    queryKey: ['parent-requests'],
    queryFn: getParentRequests,
    enabled: isParent,
  });

  const authorizationCount = isParent
    ? parentRequestData?.requests?.length ?? 0
    : teacherAuthData?.stats?.pendingCount ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="h-[72px] flex-row items-center justify-between px-6">
        <View className="flex-row items-center gap-1.5">
          <SorakMark width={20} height={20} />
          <Text className="text-lg font-semibold text-foreground">Sorak</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="h-10 max-w-[144px] flex-row items-center gap-2 rounded-full border border-border px-3">
            <Text className="flex-shrink text-sm" numberOfLines={1}>
              {username}
            </Text>
            <Icon as={ChevronDown} size={14} strokeWidth={2} className="text-muted-foreground" />
          </View>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Mở hồ sơ và cài đặt">
            <Avatar alt={name} className="size-9">
              {avatar ? <AvatarImage source={{ uri: avatar }} /> : null}
              <AvatarFallback>
                <Text className="font-semibold">{name.slice(0, 1).toUpperCase()}</Text>
              </AvatarFallback>
            </Avatar>
          </Pressable>
        </View>
      </View>
      <HomeSectionTabs isParent={isParent} onTabChange={setActiveTabIndex}>
        {isParent ? (
          <ParentReportScreen />
        ) : (
          <ReportListScreen classId={classId} search={studentSearch} />
        )}
        <DailyTimetableScreen isParent={isParent} classId={classId} />
        {isParent ? <ParentAssessmentMenuScreen /> : <TeacherAssessmentMenuScreen />}
      </HomeSectionTabs>
      <HomeBottomNav
        isParent={isParent}
        className={className}
        authorizationCount={authorizationCount}
        notificationCount={notificationData?.unreadCount ?? 0}
        showSearch={!isParent && activeTabIndex === 0}
        search={studentSearch}
        onSearchChange={setStudentSearch}
        onAuthorizationPress={() => router.push(isParent ? '/request/new' : '/request/approval')}
        onNotificationPress={() => router.push('/notifications')}
      />
    </SafeAreaView>
  );
}
