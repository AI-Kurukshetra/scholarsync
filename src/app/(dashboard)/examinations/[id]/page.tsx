import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
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
import { FileText, Calendar, Award, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ExaminationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const supabase = await createClient();
  const { id } = await params;

  const { data: exam } = await supabase
    .from('examinations')
    .select('*, class:classes(id, name), subject:subjects(id, name, code)')
    .eq('id', id)
    .single();

  if (!exam) notFound();

  const { data: results } = await supabase
    .from('exam_results')
    .select('*, student:students(id, first_name, last_name)')
    .eq('exam_id', id)
    .order('marks_obtained', { ascending: false });

  const now = new Date().toISOString().split('T')[0];
  const isUpcoming = exam.date >= now;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  const avgMarks = results && results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.marks_obtained || 0), 0) / results.length)
    : 0;

  const passCount = results?.filter((r) => (r.marks_obtained / exam.max_marks) * 100 >= 40).length || 0;

  return (
    <>
      <PageHeader title={exam.name} description={`${exam.class?.name} - ${exam.subject?.name}`}>
        <Button variant="outline" size="sm" asChild>
          <Link href="/examinations">Back to Examinations</Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-secondary/20">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">{formatDate(exam.date)}</p>
              <p className="text-xs text-muted-foreground">Exam Date</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/20">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {exam.start_time ? `${formatTime(exam.start_time)} - ${formatTime(exam.end_time)}` : 'Not set'}
              </p>
              <p className="text-xs text-muted-foreground">Time</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/20">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Award className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">{exam.max_marks} marks</p>
              <p className="text-xs text-muted-foreground">Maximum Score</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/20">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">{exam.room || 'Not assigned'}</p>
              <p className="text-xs text-muted-foreground">Room</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Exam Results</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              {results && results.length > 0 && (
                <>
                  <span className="text-xs text-muted-foreground">
                    Avg: <span className="font-semibold text-foreground">{avgMarks}/{exam.max_marks}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Pass: <span className="font-semibold text-foreground">{passCount}/{results.length}</span>
                  </span>
                </>
              )}
              <Badge variant={isUpcoming ? 'default' : 'success'}>
                {isUpcoming ? 'Upcoming' : 'Completed'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-12">#</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Marks Obtained</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Percentage</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grade</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results?.map((result, i) => {
                  const percentage = Math.round((result.marks_obtained / exam.max_marks) * 100);
                  const grade =
                    percentage >= 90 ? 'A+' :
                    percentage >= 80 ? 'A' :
                    percentage >= 70 ? 'B' :
                    percentage >= 60 ? 'C' :
                    percentage >= 50 ? 'D' :
                    percentage >= 40 ? 'E' : 'F';
                  const passed = percentage >= 40;

                  return (
                    <TableRow key={result.id} className="hover:bg-secondary/20 transition-colors">
                      <TableCell className="text-xs text-muted-foreground font-mono">{i + 1}</TableCell>
                      <TableCell className="text-sm font-medium">
                        {result.student?.first_name} {result.student?.last_name}
                      </TableCell>
                      <TableCell className="text-sm font-mono font-semibold">
                        {result.marks_obtained} / {exam.max_marks}
                      </TableCell>
                      <TableCell className="text-sm font-mono">{percentage}%</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs font-semibold">
                          {grade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={passed ? 'success' : 'destructive'}>
                          {passed ? 'Pass' : 'Fail'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!results || results.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-12">
                      {isUpcoming ? 'Results will be available after the examination.' : 'No results have been entered yet.'}
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
