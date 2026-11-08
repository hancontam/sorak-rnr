import { useState } from 'react';

import { StudentReport } from '../components/StudentReport';
import { useParentReport } from '../hooks/useStudentReport';

export default function ParentReportScreen() {
  const [semester, setSemester] = useState(undefined);
  const report = useParentReport(semester);
  return <StudentReport {...report} semester={semester} onSemesterChange={setSemester} />;
}
