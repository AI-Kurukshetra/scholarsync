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
import { FileText, Calendar, BookOpen, Award, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function ExaminationsPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: examinations } = await supabase
    .from('examinations')
    .select('*, class:classes(id, name), subject:subjects(id, name, code)')
    .order('date', { ascending: false });

  const now = new Date().toISOString().split('T')[0];
  const upcoming = examinations?.filter((e) => e.date >= now) || [];
  const completed = examinations?.filter((e) => e.date < now) || [];
  const totalExams = examinations?.length || 0;
  const uniqueSubjects = new Set(examinations?.map((e) => e.subject?.name)).size;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (t: string) => {
    if (!t) return '-';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    return `${hr > 12 ? hr - 12 : hr}:${m} ${ampm}`;
  };

  return (
    <>
      <PageHeader title="Examinations" description="Schedule and manage examinations">
        {(profile.role === 'admin' || profile.role === 'teacher') && (
          <Button size="sm" asChild>
            <Link href="/examinations/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create Exam
            </Link>
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Exams" value={totalExams} description="All examinations" icon={FileText} />
        <StatCard title="Upcoming" value={upcoming.length} description="Scheduled exams" icon={Calendar} />
        <StatCard title="Completed" value={completed.length} description="Past exams" icon={Award} />
        <StatCard title="Subjects" value={uniqueSubjects} description="Covered in exams" icon={BookOpen} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">All Examinations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Exam Name</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Class</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max Marks</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Room</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examinations?.map((exam) => {
                  const isUpcoming = exam.date >= now;
                  return (
                    <TableRow key={exam.id} className="hover:bg-secondary/20 transition-colors">
                      <TableCell>
                        <Link href={`/examinations/${exam.id}`} className="text-sm font-medium hover:text-primary transition-colors">
                          {exam.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{exam.class?.name}</TableCell>
                      <TableCell className="text-sm">
                        <Badge variant="secondary" className="text-xs">
                          {exam.subject?.code}
                        </Badge>
                        <span className="ml-1.5 text-sm">{exam.subject?.name}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(exam.date)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">{formatTime(exam.start_time)}</TableCell>
                      <TableCell className="text-sm font-mono font-semibold">{exam.max_marks}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{exam.room || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={isUpcoming ? 'default' : 'success'}>
                          {isUpcoming ? 'Upcoming' : 'Completed'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!examinations || examinations.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-12">
                      No examinations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
