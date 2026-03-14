import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/shared/stat-card';
import { PageHeader } from '@/components/shared/page-header';
import { Users, ClipboardCheck, CreditCard, GraduationCap, TrendingUp, Megaphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardCharts } from './dashboard-charts';

export default async function DashboardPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const [
    { count: studentCount },
    { count: teacherCount },
    { data: attendanceData },
    { data: payments },
    { data: announcements },
    { data: recentPayments },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
    supabase.from('attendance').select('status'),
    supabase.from('fee_payments').select('amount_paid, status'),
    supabase.from('announcements').select('*, author:profiles(full_name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('fee_payments').select('*, student:students(first_name, last_name), fee_structure:fee_structures(name)').order('created_at', { ascending: false }).limit(5),
  ]);

  const totalAttendance = attendanceData?.length || 0;
  const presentCount = attendanceData?.filter(a => a.status === 'present' || a.status === 'late').length || 0;
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  const totalRevenue = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount_paid, 0) || 0;

  const greeting = profile.role === 'admin'
    ? 'Admin Dashboard'
    : profile.role === 'teacher'
    ? 'Teacher Dashboard'
    : 'Parent Dashboard';

  return (
    <>
      <PageHeader
        title={`Welcome back, ${profile.full_name.split(' ')[0]}`}
        description={greeting}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={studentCount || 0} description="Active enrollments" icon={Users} trend={{ value: 12, label: 'this term' }} />
        <StatCard title="Attendance Rate" value={`${attendanceRate}%`} description="Overall average" icon={ClipboardCheck} trend={{ value: attendanceRate > 90 ? 3 : -2, label: 'vs last week' }} />
        <StatCard title="Revenue Collected" value={`$${totalRevenue.toLocaleString()}`} description="Total payments received" icon={CreditCard} trend={{ value: 8, label: 'this month' }} />
        <StatCard title="Teachers" value={teacherCount || 0} description="Active faculty" icon={GraduationCap} />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Trend</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <DashboardCharts attendanceData={attendanceData || []} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-accent" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Announcements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements?.map((a) => (
                <div key={a.id} className="group p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">{a.title}</p>
                    {a.is_pinned && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Pinned</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {a.author?.full_name} &middot; {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {(!announcements || announcements.length === 0) && (
                <p className="text-sm text-muted-foreground">No announcements yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Payments</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {recentPayments?.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-secondary/30 transition-colors">
                <div>
                  <p className="text-sm font-medium">{p.student?.first_name} {p.student?.last_name}</p>
                  <p className="text-xs text-muted-foreground">{p.fee_structure?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-semibold">${p.amount_paid}</span>
                  <Badge variant={p.status === 'paid' ? 'success' : p.status === 'overdue' ? 'destructive' : 'warning'}>
                    {p.status}
                  </Badge>
                </div>
              </div>
            ))}
            {(!recentPayments || recentPayments.length === 0) && (
              <p className="text-sm text-muted-foreground">No recent payments.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
