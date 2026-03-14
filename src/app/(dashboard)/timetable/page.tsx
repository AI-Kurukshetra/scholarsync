import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, BookOpen, GraduationCap, Plus } from 'lucide-react';
import Link from 'next/link';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
const DAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri' } as const;

interface TimetableEntry {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  room: string | null;
  subject: { id: string; name: string; code: string } | null;
  teacher: { id: string; full_name: string } | null;
}

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ class_id?: string }>;
}) {
  const profile = await requireAuth();
  const supabase = await createClient();
  const params = await searchParams;
  const selectedClassId = params.class_id || '';

  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, grade_level')
    .order('grade_level');

  let timetableEntries: TimetableEntry[] = [];

  if (selectedClassId) {
    const { data } = await supabase
      .from('timetables')
      .select('id, day, start_time, end_time, room, subject:subjects(id, name, code), teacher:profiles(id, full_name)')
      .eq('class_id', selectedClassId)
      .order('start_time');

    timetableEntries = (data as unknown as TimetableEntry[]) || [];
  }

  const timeSlots = Array.from(
    new Set(timetableEntries.map((e) => `${e.start_time}-${e.end_time}`))
  ).sort();

  const getEntry = (day: string, timeSlot: string) => {
    const [start, end] = timeSlot.split('-');
    return timetableEntries.find(
      (e) => e.day === day && e.start_time === start && e.end_time === end
    );
  };

  const totalPeriods = timetableEntries.length;
  const uniqueSubjects = new Set(timetableEntries.map((e) => e.subject?.name)).size;
  const uniqueTeachers = new Set(timetableEntries.map((e) => e.teacher?.full_name)).size;

  const formatTime = (t: string) => {
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    return `${hr > 12 ? hr - 12 : hr}:${m} ${ampm}`;
  };

  return (
    <>
      <PageHeader title="Timetable" description="View weekly class schedules">
        {profile.role === 'admin' && (
          <Button size="sm" asChild>
            <Link href="/timetable/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Period
            </Link>
          </Button>
        )}
      </PageHeader>

      {selectedClassId && timetableEntries.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Total Periods" value={totalPeriods} description="Per week" icon={Calendar} />
          <StatCard title="Subjects" value={uniqueSubjects} description="Unique subjects" icon={BookOpen} />
          <StatCard title="Teachers" value={uniqueTeachers} description="Assigned teachers" icon={GraduationCap} />
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Schedule</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {classes?.map((c) => (
              <Link key={c.id} href={`/timetable?class_id=${c.id}`}>
                <Badge
                  variant={selectedClassId === c.id ? 'default' : 'secondary'}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {c.name}
                </Badge>
              </Link>
            ))}
          </div>

          {selectedClassId && timeSlots.length > 0 && (
            <div className="rounded-xl border border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 inline mr-1" />
                      Time
                    </TableHead>
                    {DAYS.map((day) => (
                      <TableHead key={day} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
                        {DAY_SHORT[day]}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeSlots.map((slot) => {
                    const [start, end] = slot.split('-');
                    return (
                      <TableRow key={slot} className="hover:bg-secondary/20 transition-colors">
                        <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                          {formatTime(start)}
                          <br />
                          {formatTime(end)}
                        </TableCell>
                        {DAYS.map((day) => {
                          const entry = getEntry(day, slot);
                          return (
                            <TableCell key={day} className="text-center min-w-[120px]">
                              {entry ? (
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">{entry.subject?.name}</p>
                                  <p className="text-xs text-muted-foreground">{entry.teacher?.full_name}</p>
                                  {entry.room && (
                                    <Badge variant="secondary" className="text-[10px]">
                                      {entry.room}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground/50">-</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {selectedClassId && timeSlots.length === 0 && (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No timetable entries found for this class.
            </p>
          )}

          {!selectedClassId && (
            <p className="text-sm text-muted-foreground py-12 text-center">
              Select a class above to view its timetable.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
