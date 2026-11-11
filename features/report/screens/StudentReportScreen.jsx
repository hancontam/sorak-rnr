import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { StudentReport } from '../components/StudentReport';
import { useStudentReport } from '../hooks/useStudentReport';

export default function StudentReportScreen() {
  const { studentId } = useLocalSearchParams();
  const [semester, setSemester] = useState(undefined);
  const report = useStudentReport(typeof studentId === 'string' ? studentId : null, semester);
  return <StudentReport {...report} semester={semester} onSemesterChange={setSemester} />;
}
