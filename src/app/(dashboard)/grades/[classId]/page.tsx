import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
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
import { GradebookActions } from './gradebook-actions';

export default async function GradebookPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const profile = await requireAuth();
  const supabase = await createClient();
  const { classId } = await params;

  const { data: cls } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single();

  if (!cls) notFound();

  const { data: students } = await supabase.from('students').select('id, first_name, last_name').eq('class_id', classId).eq('status', 'active').order('last_name');

  // Fetch all assignments for this class via class_subjects
  const { data: classSubjects } = await supabase
    .from('class_subjects')
    .select('id')
    .eq('class_id', classId);

  const csIds = classSubjects?.map((cs) => cs.id) || [];

  const { data: classAssignments } = csIds.length > 0
    ? await supabase.from('assignments').select('*, class_subject:class_subjects(subject:subjects(name))').in('class_subject_id', csIds).order('due_date')
    : { data: [] };

  const studentIds = students?.map((s) => s.id) || [];
  const assignmentIds = classAssignments?.map((a) => a.id) || [];

  const { data: allGrades } = studentIds.length > 0 && assignmentIds.length > 0
    ? await supabase.from('grades').select('*').in('student_id', studentIds).in('assignment_id', assignmentIds)
    : { data: [] };

  const gradeMap = new Map<string, number>();
  allGrades?.forEach((g) => {
    gradeMap.set(`${g.student_id}-${g.assignment_id}`, g.score);
  });

  return (
    <>
      <PageHeader title={`Gradebook: ${cls.name}`} description={`Grade ${cls.grade_level} - Section ${cls.section}`}>
        {(profile.role === 'admin' || profile.role === 'teacher') && (
          <GradebookActions classSubjectIds={csIds} />
        )}
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Student Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background">Student</TableHead>
                  {classAssignments?.map((a) => (
                    <TableHead key={a.id} className="text-center min-w-[100px]">
                      <div className="text-xs">{a.title}</div>
                      <div className="text-xs text-muted-foreground">/{a.max_score}</div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Average</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.map((student) => {
                  const scores = classAssignments?.map((a) => {
                    const score = gradeMap.get(`${student.id}-${a.id}`);
                    return score !== undefined ? (score / a.max_score) * 100 : null;
                  }).filter((s): s is number => s !== null) || [];
                  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="sticky left-0 bg-background font-medium">
                        {student.first_name} {student.last_name}
                      </TableCell>
                      {classAssignments?.map((a) => {
                        const score = gradeMap.get(`${student.id}-${a.id}`);
                        return (
                          <TableCell key={a.id} className="text-center">
                            {score !== undefined ? score : '—'}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center">
                        {avg !== null ? (
                          <Badge variant={avg >= 70 ? 'default' : avg >= 50 ? 'secondary' : 'destructive'}>
                            {avg}%
                          </Badge>
                        ) : '—'}
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
