import { AssessmentOptionCard } from '@/components/ui/assessment-option-card';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { BookOpenCheck, ClipboardCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

// Nội dung tab "Kết quả đánh giá" của phụ huynh (Figma 2314:3684).
export default function ParentAssessmentMenuScreen() {
  const router = useRouter();
  const student = useAuthStore((state) => state.user?.student);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96 }}>
      <Text className="mb-2 text-sm text-muted-foreground">
        {student?.fullName ? `Kết quả của ${student.fullName}` : 'Kết quả học tập của con'}
      </Text>
      <View className="gap-3">
        <AssessmentOptionCard
          icon={BookOpenCheck}
          title="Sổ liên lạc"
          description="Xem nhận xét của cô và phản hồi"
          onPress={() => router.push('/assessment/parent-contact-book')}
        />
        <AssessmentOptionCard
          icon={ClipboardCheck}
          title="Đánh giá học kỳ"
          description="Xem kết quả học kỳ và ghi nhận xét"
          onPress={() => router.push('/assessment/parent-semester')}
        />
      </View>
    </ScrollView>
  );
}
