import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Award, GraduationCap, Medal, Star, Trophy } from 'lucide-react';
import { CertificateActions } from './certificate-actions';

interface CertificateStudent {
  id: string;
  first_name: string;
  last_name: string;
  className: string;
  avgMarks: number;
  totalExams: number;
  grade: string;
  attendanceRate: number;
  certificateType: 'merit' | 'participation' | 'excellence' | 'attendance';
}

function getGrade(pct: number): string {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
}

function getCertType(avgMarks: number, attendanceRate: number): 'excellence' | 'merit' | 'attendance' | 'participation' {
  if (avgMarks >= 85 && attendanceRate >= 90) return 'excellence';
  if (avgMarks >= 70) return 'merit';
  if (attendanceRate >= 95) return 'attendance';
  return 'participation';
}

const certConfig = {
  excellence: { label: 'Excellence', icon: Trophy, color: 'text-amber-500', bg: 'from-amber-500 to-orange-500' },
  merit: { label: 'Merit', icon: Medal, color: 'text-violet-500', bg: 'from-violet-500 to-purple-500' },
  attendance: { label: 'Attendance', icon: Star, color: 'text-cyan-500', bg: 'from-cyan-500 to-blue-500' },
  participation: { label: 'Participation', icon: Award, color: 'text-emerald-500', bg: 'from-emerald-500 to-green-500' },
};

export default async function CertificatesPage() {
  await requireAuth();
  const supabase = await createClient();

  const [
    { data: students },
    { data: examResults },
    { data: attendance },
    { data: classes },
  ] = await Promise.all([
    supabase.from('students').select('id, first_name, last_name, class_id').eq('status', 'active'),
    supabase.from('exam_results').select('student_id, marks_obtained, exam:examinations(max_marks)'),
    supabase.from('attendance').select('student_id, status'),
    supabase.from('classes').select('id, name'),
  ]);

  const classMap = new Map((classes || []).map(c => [c.id, c.name]));

  const certStudents: CertificateStudent[] = (students || []).map(s => {
    const studentExams = (examResults || []).filter(e => e.student_id === s.id);
    const totalExams = studentExams.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avgMarks = totalExams > 0 ? Math.round(studentExams.reduce((sum, e: any) => sum + (e.marks_obtained / (e.exam?.max_marks || 100)) * 100, 0) / totalExams) : 0;

    const studentAtt = (attendance || []).filter(a => a.student_id === s.id);
    const attendanceRate = studentAtt.length > 0
      ? Math.round(studentAtt.filter(a => a.status === 'present' || a.status === 'late').length / studentAtt.length * 100)
      : 100;

    return {
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      className: classMap.get(s.class_id) || '-',
      avgMarks,
      totalExams,
      grade: getGrade(avgMarks),
      attendanceRate,
      certificateType: getCertType(avgMarks, attendanceRate),
    };
  });

  certStudents.sort((a, b) => b.avgMarks - a.avgMarks);

  const counts = {
    excellence: certStudents.filter(s => s.certificateType === 'excellence').length,
    merit: certStudents.filter(s => s.certificateType === 'merit').length,
    attendance: certStudents.filter(s => s.certificateType === 'attendance').length,
    participation: certStudents.filter(s => s.certificateType === 'participation').length,
  };

  return (
    <>
      <PageHeader
        title="Certificates"
        description="Generate and manage student certificates based on performance"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.entries(certConfig) as [keyof typeof certConfig, typeof certConfig[keyof typeof certConfig]][]).map(([key, config]) => (
          <Card key={key}>
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.bg} flex items-center justify-center shadow-lg`}>
                <config.icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{counts[key]}</p>
                <p className="text-xs text-muted-foreground">{config.label} Certificates</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Student Certificates</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Class</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Marks</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grade</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attendance</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Certificate</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certStudents.slice(0, 30).map((student) => {
                  const config = certConfig[student.certificateType];
                  return (
                    <TableRow key={student.id} className="hover:bg-secondary/20 transition-colors">
                      <TableCell className="text-sm font-medium">
                        {student.first_name} {student.last_name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{student.className}</TableCell>
                      <TableCell className="text-sm font-mono">
                        <span className={student.avgMarks >= 70 ? 'text-emerald-500' : student.avgMarks >= 50 ? 'text-amber-500' : 'text-red-500'}>
                          {student.avgMarks}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.grade.startsWith('A') ? 'success' : student.grade === 'B+' || student.grade === 'B' ? 'warning' : 'destructive'}>
                          {student.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        <span className={student.attendanceRate >= 90 ? 'text-emerald-500' : student.attendanceRate >= 75 ? 'text-amber-500' : 'text-red-500'}>
                          {student.attendanceRate}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <config.icon className={`h-3 w-3 ${config.color}`} />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <CertificateActions
                          studentName={`${student.first_name} ${student.last_name}`}
                          className={student.className}
                          grade={student.grade}
                          avgMarks={student.avgMarks}
                          certificateType={student.certificateType}
                          attendanceRate={student.attendanceRate}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
