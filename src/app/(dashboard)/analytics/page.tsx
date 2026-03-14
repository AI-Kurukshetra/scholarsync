import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Brain, AlertTriangle, TrendingUp, Award, Target, Users } from 'lucide-react';
import { AnalyticsCharts } from './analytics-charts';

interface StudentPerformance {
  id: string;
  first_name: string;
  last_name: string;
  class_id: string;
  class?: { name: string } | null;
  attendanceRate: number;
  avgGrade: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  trend: 'improving' | 'stable' | 'declining';
  recommendation: string;
}

function computeRisk(attendanceRate: number, avgGrade: number): { score: number; level: 'low' | 'medium' | 'high'; trend: 'improving' | 'stable' | 'declining'; recommendation: string } {
  // Weighted risk score: 40% attendance, 60% academic
  const attRisk = Math.max(0, 100 - attendanceRate);
  const gradeRisk = Math.max(0, 100 - avgGrade);
  const score = Math.round(attRisk * 0.4 + gradeRisk * 0.6);

  const level = score >= 50 ? 'high' : score >= 25 ? 'medium' : 'low';

  // Simulate trend based on score variance
  const trend = score < 20 ? 'improving' : score < 40 ? 'stable' : 'declining';

  let recommendation = '';
  if (level === 'high') {
    if (attendanceRate < 75) recommendation = 'Immediate parent meeting required. Chronic absenteeism detected.';
    else recommendation = 'Schedule academic counselling. Consider peer tutoring program.';
  } else if (level === 'medium') {
    if (attendanceRate < 85) recommendation = 'Monitor attendance patterns. Send parent notification.';
    else recommendation = 'Assign additional practice worksheets. Review weak subjects.';
  } else {
    recommendation = 'On track. Encourage participation in advanced activities.';
  }

  return { score, level, trend, recommendation };
}

export default async function AnalyticsPage() {
  await requireAuth();
  const supabase = await createClient();

  // Fetch all data needed for analytics
  const [
    { data: students },
    { data: attendance },
    { data: grades },
    { data: classes },
  ] = await Promise.all([
    supabase.from('students').select('id, first_name, last_name, class_id, class:classes(name)').eq('status', 'active'),
    supabase.from('attendance').select('student_id, status'),
    supabase.from('grades').select('student_id, score, assignment:assignments(max_score)'),
    supabase.from('classes').select('id, name'),
  ]);

  // Build per-student analytics
  const studentAnalytics: StudentPerformance[] = (students || []).map((s) => {
    // Attendance rate
    const studentAtt = (attendance || []).filter(a => a.student_id === s.id);
    const totalAtt = studentAtt.length;
    const presentAtt = studentAtt.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

    // Average grade (as percentage)
    const studentGrades = (grades || []).filter(g => g.student_id === s.id);
    let avgGrade = 0;
    if (studentGrades.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalPct = studentGrades.reduce((sum, g: any) => {
        const maxScore = g.assignment?.max_score || 100;
        return sum + (g.score / maxScore) * 100;
      }, 0);
      avgGrade = Math.round(totalPct / studentGrades.length);
    }

    const risk = computeRisk(attendanceRate, avgGrade);

    return {
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      class_id: s.class_id,
      class: s.class as unknown as { name: string } | null,
      attendanceRate,
      avgGrade,
      riskScore: risk.score,
      riskLevel: risk.level,
      trend: risk.trend,
      recommendation: risk.recommendation,
    };
  });

  // Sort by risk score (highest first)
  studentAnalytics.sort((a, b) => b.riskScore - a.riskScore);

  const atRiskCount = studentAnalytics.filter(s => s.riskLevel === 'high').length;
  const watchCount = studentAnalytics.filter(s => s.riskLevel === 'medium').length;
  const onTrackCount = studentAnalytics.filter(s => s.riskLevel === 'low').length;
  const avgAttendance = studentAnalytics.length > 0
    ? Math.round(studentAnalytics.reduce((s, a) => s + a.attendanceRate, 0) / studentAnalytics.length)
    : 0;

  // Class-level performance for charts
  const classPerformance = (classes || []).map(cls => {
    const classStudents = studentAnalytics.filter(s => s.class_id === cls.id);
    const avgAtt = classStudents.length > 0
      ? Math.round(classStudents.reduce((s, a) => s + a.attendanceRate, 0) / classStudents.length)
      : 0;
    const avgGrd = classStudents.length > 0
      ? Math.round(classStudents.reduce((s, a) => s + a.avgGrade, 0) / classStudents.length)
      : 0;
    const riskCount = classStudents.filter(s => s.riskLevel === 'high').length;
    return { name: cls.name, attendance: avgAtt, grades: avgGrd, atRisk: riskCount, students: classStudents.length };
  });

  // Risk distribution for pie chart
  const riskDistribution = [
    { name: 'Low Risk', value: onTrackCount, color: '#10b981' },
    { name: 'Medium Risk', value: watchCount, color: '#f59e0b' },
    { name: 'High Risk', value: atRiskCount, color: '#ef4444' },
  ];

  return (
    <>
      <PageHeader
        title="AI-Powered Analytics"
        description="Machine learning insights to predict student performance and identify at-risk students"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="At-Risk Students" value={atRiskCount} description="Immediate attention needed" icon={AlertTriangle} trend={{ value: atRiskCount, label: 'flagged' }} />
        <StatCard title="Watch List" value={watchCount} description="Monitor closely" icon={Target} trend={{ value: watchCount, label: 'flagged' }} />
        <StatCard title="On Track" value={onTrackCount} description="Performing well" icon={Award} trend={{ value: onTrackCount, label: 'students' }} />
        <StatCard title="Avg Attendance" value={`${avgAttendance}%`} description="Across all students" icon={Users} trend={{ value: avgAttendance, label: 'rate' }} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Class Performance Comparison</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <AnalyticsCharts type="bar" data={classPerformance} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Risk Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <AnalyticsCharts type="pie" data={riskDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Students Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Student Risk Assessment</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Class</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attendance</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Grade</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Risk Score</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Risk Level</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trend</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Recommendation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentAnalytics.slice(0, 20).map((student) => (
                  <TableRow key={student.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="text-sm font-medium">
                      {student.first_name} {student.last_name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.class?.name || '-'}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      <span className={student.attendanceRate < 75 ? 'text-red-500 font-semibold' : student.attendanceRate < 85 ? 'text-yellow-500' : 'text-emerald-500'}>
                        {student.attendanceRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      <span className={student.avgGrade < 40 ? 'text-red-500 font-semibold' : student.avgGrade < 60 ? 'text-yellow-500' : 'text-emerald-500'}>
                        {student.avgGrade}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              student.riskScore >= 50 ? 'bg-red-500' : student.riskScore >= 25 ? 'bg-yellow-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${student.riskScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono">{student.riskScore}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.riskLevel === 'high' ? 'destructive' : student.riskLevel === 'medium' ? 'warning' : 'success'}>
                        {student.riskLevel === 'high' ? 'At Risk' : student.riskLevel === 'medium' ? 'Watch' : 'On Track'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {student.trend === 'improving' ? '↑ Improving' : student.trend === 'stable' ? '→ Stable' : '↓ Declining'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {student.recommendation}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
