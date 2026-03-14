import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const supabase = await createClient();
  const { id } = await params;

  const { data: student } = await supabase
    .from('students')
    .select('*, class:classes(name, grade_level, section)')
    .eq('id', id)
    .single();

  if (!student) notFound();

  const [{ data: attendance }, { data: grades }, { data: feePayments }] = await Promise.all([
    supabase
      .from('attendance')
      .select('*')
      .eq('student_id', id)
      .order('date', { ascending: false })
      .limit(30),
    supabase
      .from('grades')
      .select('*, assignment:assignments(title, max_score, class_subject:class_subjects(subject:subjects(name)))')
      .eq('student_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('fee_payments')
      .select('*, fee_structure:fee_structures(name, amount)')
      .eq('student_id', id)
      .order('created_at', { ascending: false }),
  ]);

  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase();
  const totalAtt = attendance?.length || 0;
  const presentAtt = attendance?.filter(a => a.status === 'present' || a.status === 'late').length || 0;
  const attRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

  return (
    <>
      <PageHeader title={`${student.first_name} ${student.last_name}`}>
        <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
          {student.status}
        </Badge>
      </PageHeader>

      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-muted-foreground">{student.email}</p>
          <p className="text-sm text-muted-foreground">
            Class: {student.class?.name} &middot; DOB: {new Date(student.date_of_birth).toLocaleDateString()} &middot; Gender: {student.gender}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Attendance Rate</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{attRate}%</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Assignments Graded</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{grades?.length || 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Fee Payments</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{feePayments?.filter(f => f.status === 'paid').length || 0} paid</p></CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance?.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            a.status === 'present' ? 'default' :
                            a.status === 'absent' ? 'destructive' : 'secondary'
                          }>
                            {a.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades?.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium">{g.assignment?.title}</TableCell>
                        <TableCell>{g.assignment?.class_subject?.subject?.name}</TableCell>
                        <TableCell>{g.score}/{g.assignment?.max_score}</TableCell>
                        <TableCell className="text-muted-foreground">{g.remarks || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fee</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feePayments?.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.fee_structure?.name}</TableCell>
                        <TableCell>${f.fee_structure?.amount}</TableCell>
                        <TableCell>${f.amount_paid}</TableCell>
                        <TableCell>
                          <Badge variant={
                            f.status === 'paid' ? 'default' :
                            f.status === 'overdue' ? 'destructive' : 'secondary'
                          }>
                            {f.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
