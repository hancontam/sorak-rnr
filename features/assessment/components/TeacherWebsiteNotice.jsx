import { Monitor } from 'lucide-react-native';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const INSTRUCTIONS = {
  monthly: 'Để đánh giá Sổ bé ngoan (sổ liên lạc), vui lòng vào Sorak trên website.',
  semester: 'Để tính toán kết quả học kỳ, vui lòng vào Sorak trên website.',
};

export function TeacherWebsiteNotice({ kind }) {
  return (
    <Alert icon={Monitor}>
      <AlertTitle className="text-sm">Thực hiện trên website</AlertTitle>
      <AlertDescription className="text-xs leading-5">
        {INSTRUCTIONS[kind] ||
          'Ứng dụng dùng để xem kết quả. Vui lòng vào Sorak trên website để đánh giá Sổ bé ngoan và tính toán kết quả học kỳ.'}
      </AlertDescription>
    </Alert>
  );
}
