import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/shared/stat-card';
import { ClipboardCheck, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { AttendanceReportChart } from './attendance-report-chart';

export default async function AttendanceReportsPage() {
  await requireAuth();
  const supabase = await createClient();

  const { data: attendance } = await supabase
    .from('attendance')
    .select('status, date, student_id');

  const total = attendance?.length || 0;
  const present = attendance?.filter(a => a.status === 'present').length || 0;
  const late = attendance?.filter(a => a.status === 'late').length || 0;
  const absent = attendance?.filter(a => a.status === 'absent').length || 0;
  const excused = attendance?.filter(a => a.status === 'excused').length || 0;
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  // Group by date
  const byDate = new Map<string, { present: number; absent: number; total: number }>();
  attendance?.forEach((a) => {
    const entry = byDate.get(a.date) || { present: 0, absent: 0, total: 0 };
    entry.total++;
    if (a.status === 'present' || a.status === 'late') entry.present++;
    else entry.absent++;
    byDate.set(a.date, entry);
  });

  const chartData = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      present: data.present,
      absent: data.absent,
      rate: Math.round((data.present / data.total) * 100),
    }));

  return (
    <>
      <PageHeader title="Attendance Reports" description="Overview of attendance patterns" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Overall Rate" value={`${rate}%`} icon={TrendingUp} />
        <StatCard title="Present" value={present + late} description={`${late} late arrivals`} icon={ClipboardCheck} />
        <StatCard title="Absent" value={absent} icon={AlertTriangle} />
        <StatCard title="Excused" value={excused} icon={Users} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceReportChart data={chartData} />
        </CardContent>
      </Card>
    </>
  );
}
