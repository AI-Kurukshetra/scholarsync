import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import {
  Bell, MessageSquare, Megaphone, CreditCard, ClipboardCheck,
  BookOpen, Calendar, AlertTriangle, CheckCircle2, Info,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'message' | 'announcement' | 'fee' | 'attendance' | 'grade' | 'event';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const typeConfig = {
  message: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  announcement: { icon: Megaphone, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  fee: { icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  attendance: { icon: ClipboardCheck, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  grade: { icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  event: { icon: Calendar, color: 'text-pink-500', bg: 'bg-pink-500/10' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function NotificationsPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  // Aggregate notifications from multiple sources
  const notifications: Notification[] = [];

  // 1. Recent messages to this user
  const { data: msgs } = await supabase
    .from('messages')
    .select('id, subject, content, created_at, is_read, sender:profiles!messages_sender_id_fkey(full_name)')
    .eq('recipient_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10);

  for (const m of msgs || []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sender = (m.sender as any)?.full_name || 'Someone';
    notifications.push({
      id: `msg-${m.id}`,
      type: 'message',
      title: m.subject || 'New Message',
      description: `From ${sender}: ${(m.content || '').slice(0, 80)}`,
      time: m.created_at,
      read: m.is_read,
    });
  }

  // 2. Recent announcements
  const { data: anns } = await supabase
    .from('announcements')
    .select('id, title, content, created_at, target_role')
    .or(`target_role.eq.all,target_role.eq.${profile.role}`)
    .order('created_at', { ascending: false })
    .limit(8);

  for (const a of anns || []) {
    notifications.push({
      id: `ann-${a.id}`,
      type: 'announcement',
      title: a.title,
      description: (a.content || '').slice(0, 100),
      time: a.created_at,
      read: false,
    });
  }

  // 3. Upcoming events (next 7 days)
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const { data: events } = await supabase
    .from('events')
    .select('id, title, event_date, location')
    .gte('event_date', today)
    .lte('event_date', nextWeek)
    .order('event_date', { ascending: true })
    .limit(5);

  for (const e of events || []) {
    notifications.push({
      id: `evt-${e.id}`,
      type: 'event',
      title: `Upcoming: ${e.title}`,
      description: `${new Date(e.event_date).toLocaleDateString()}${e.location ? ` at ${e.location}` : ''}`,
      time: e.event_date,
      read: false,
    });
  }

  // 4. Overdue fee payments (for admin)
  if (profile.role === 'admin') {
    const { data: overdueFees } = await supabase
      .from('fee_payments')
      .select('id, amount_paid, status, student:students(first_name, last_name)')
      .eq('status', 'overdue')
      .limit(5);

    for (const f of overdueFees || []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const student = f.student as any;
      notifications.push({
        id: `fee-${f.id}`,
        type: 'fee',
        title: 'Overdue Fee Payment',
        description: `${student?.first_name} ${student?.last_name} has an overdue payment`,
        time: new Date().toISOString(),
        read: false,
      });
    }
  }

  // 5. Recent grade updates (for parents/teachers)
  if (profile.role === 'teacher' || profile.role === 'parent') {
    const { data: recentGrades } = await supabase
      .from('grades')
      .select('id, score, created_at, student:students(first_name, last_name), assignment:assignments(title, max_score)')
      .order('created_at', { ascending: false })
      .limit(5);

    for (const g of recentGrades || []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const student = g.student as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const assignment = g.assignment as any;
      notifications.push({
        id: `grd-${g.id}`,
        type: 'grade',
        title: 'Grade Posted',
        description: `${student?.first_name} ${student?.last_name} scored ${g.score}/${assignment?.max_score} on ${assignment?.title}`,
        time: g.created_at,
        read: false,
      });
    }
  }

  // Sort by time, newest first
  notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{notifications.length}</p>
              <p className="text-xs text-muted-foreground">Total Notifications</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unreadCount}</p>
              <p className="text-xs text-muted-foreground">Unread</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{notifications.length - unreadCount}</p>
              <p className="text-xs text-muted-foreground">Read</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        {notifications.map((notification) => {
          const config = typeConfig[notification.type];
          const Icon = config.icon;
          return (
            <Card
              key={notification.id}
              className={`group hover:ring-1 hover:ring-primary/20 transition-all ${!notification.read ? 'border-l-2 border-l-primary' : ''}`}
            >
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {notification.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {timeAgo(notification.time)}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.6)]" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {notifications.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
