import { AssessmentOptionCard } from '@/components/ui/assessment-option-card';
import { Text } from '@/components/ui/text';
import { BookOpenCheck, ClipboardCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

// Nội dung tab "Đánh giá giai đoạn" của giáo viên (Figma 2187:1066).
export default function TeacherAssessmentMenuScreen() {
  const router = useRouter();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96 }}>
      <Text className="mb-2 text-sm text-muted-foreground">Nội dung đánh giá</Text>
      <View className="gap-3">
        <AssessmentOptionCard
          icon={BookOpenCheck}
          title="Sổ bé ngoan"
          description="Theo dõi nhận xét và tiến bộ của trẻ"
          onPress={() => router.push('/assessment/teacher-good-child')}
        />
        <AssessmentOptionCard
          icon={ClipboardCheck}
          title="Đánh giá học kì"
          description="Xem kết quả đánh giá theo từng học kì"
          onPress={() => router.push('/assessment/teacher-semester')}
        />
      </View>
    </ScrollView>
  );
}
