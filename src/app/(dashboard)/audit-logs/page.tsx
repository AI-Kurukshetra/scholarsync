import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/stat-card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Shield, Activity, UserCheck, FileEdit, CreditCard, ClipboardCheck, BookOpen } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  category: string;
  user: string;
  role: string;
  details: string;
  timestamp: string;
}

export default async function AuditLogsPage() {
  const profile = await requireAuth();

  if (profile.role !== 'admin') {
    return (
      <>
        <PageHeader title="Audit Logs" description="System activity tracking" />
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Access restricted to administrators only.
          </CardContent>
        </Card>
      </>
    );
  }

  const supabase = await createClient();

  // Build audit log by querying recent activities across tables
  const auditEntries: AuditEntry[] = [];

  // 1. Recent attendance markings
  const { data: recentAttendance } = await supabase
    .from('attendance')
    .select('id, date, status, created_at, student:students(first_name, last_name), marker:profiles!attendance_marked_by_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(15);

  for (const a of recentAttendance || []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const student = a.student as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const marker = a.marker as any;
    auditEntries.push({
      id: `att-${a.id}`,
      action: 'Attendance Marked',
      category: 'attendance',
      user: marker?.full_name || 'System',
      role: 'teacher',
      details: `Marked ${student?.first_name} ${student?.last_name} as ${a.status} on ${a.date}`,
      timestamp: a.created_at,
    });
  }

  // 2. Recent grade entries
  const { data: recentGrades } = await supabase
    .from('grades')
    .select('id, score, created_at, student:students(first_name, last_name), grader:profiles!grades_graded_by_fkey(full_name), assignment:assignments(title)')
    .order('created_at', { ascending: false })
    .limit(15);

  for (const g of recentGrades || []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const student = g.student as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const grader = g.grader as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignment = g.assignment as any;
    auditEntries.push({
      id: `grd-${g.id}`,
      action: 'Grade Recorded',
      category: 'grades',
      user: grader?.full_name || 'System',
      role: 'teacher',
      details: `Graded ${student?.first_name} ${student?.last_name}: ${g.score} on "${assignment?.title}"`,
      timestamp: g.created_at,
    });
  }

  // 3. Recent fee payments
  const { data: recentPayments } = await supabase
    .from('fee_payments')
    .select('id, amount_paid, status, created_at, student:students(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(10);

  for (const p of recentPayments || []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const student = p.student as any;
    auditEntries.push({
      id: `pay-${p.id}`,
      action: 'Payment Recorded',
      category: 'finance',
      user: 'Admin',
      role: 'admin',
      details: `${student?.first_name} ${student?.last_name} - ₹${p.amount_paid} (${p.status})`,
      timestamp: p.created_at,
    });
  }

  // 4. Recent announcements
  const { data: recentAnnouncements } = await supabase
    .from('announcements')
    .select('id, title, created_at, author:profiles!announcements_author_id_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(8);

  for (const a of recentAnnouncements || []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const author = a.author as any;
    auditEntries.push({
      id: `ann-${a.id}`,
      action: 'Announcement Created',
      category: 'communication',
      user: author?.full_name || 'Admin',
      role: 'admin',
      details: `Published: "${a.title}"`,
      timestamp: a.created_at,
    });
  }

  // 5. Recent messages
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('id, subject, created_at, sender:profiles!messages_sender_id_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(8);

  for (const m of recentMessages || []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sender = m.sender as any;
    auditEntries.push({
      id: `msg-${m.id}`,
      action: 'Message Sent',
      category: 'communication',
      user: sender?.full_name || 'Unknown',
      role: 'teacher',
      details: `Subject: "${m.subject || 'No subject'}"`,
      timestamp: m.created_at,
    });
  }

  // Sort by timestamp, newest first
  auditEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const categoryIcons: Record<string, typeof Activity> = {
    attendance: ClipboardCheck,
    grades: BookOpen,
    finance: CreditCard,
    communication: FileEdit,
  };

  const categoryCounts = auditEntries.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <PageHeader title="Audit Logs" description="Track all system activities and changes" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Activities" value={auditEntries.length} description="Recent actions tracked" icon={Activity} />
        <StatCard title="Attendance Logs" value={categoryCounts.attendance || 0} description="Attendance markings" icon={ClipboardCheck} />
        <StatCard title="Grade Updates" value={categoryCounts.grades || 0} description="Grades recorded" icon={BookOpen} />
        <StatCard title="Financial Logs" value={categoryCounts.finance || 0} description="Payment activities" icon={CreditCard} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Activity Log</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timestamp</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditEntries.slice(0, 50).map((entry) => {
                  const CatIcon = categoryIcons[entry.category] || Activity;
                  return (
                    <TableRow key={entry.id} className="hover:bg-secondary/20 transition-colors">
                      <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{entry.action}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <CatIcon className="h-3 w-3" />
                          {entry.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{entry.user}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                        {entry.details}
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
