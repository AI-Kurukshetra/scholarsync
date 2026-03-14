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

export default async function StudentFeePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  await requireAuth();
  const supabase = await createClient();
  const { studentId } = await params;

  const { data: student } = await supabase
    .from('students')
    .select('*, class:classes(name)')
    .eq('id', studentId)
    .single();

  if (!student) notFound();

  const { data: payments } = await supabase
    .from('fee_payments')
    .select('*, fee_structure:fee_structures(name, amount, due_date)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  const totalDue = payments?.reduce((sum, p) => sum + (p.fee_structure?.amount || 0), 0) || 0;
  const totalPaid = payments?.reduce((sum, p) => sum + p.amount_paid, 0) || 0;
  const balance = totalDue - totalPaid;

  return (
    <>
      <PageHeader
        title={`${student.first_name} ${student.last_name} - Fee Invoice`}
        description={`Class: ${student.class?.name}`}
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Due</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">${totalDue.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Paid</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Balance</CardTitle></CardHeader>
          <CardContent><p className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>${balance.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ref</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.fee_structure?.name}</TableCell>
                    <TableCell>${p.fee_structure?.amount}</TableCell>
                    <TableCell>${p.amount_paid}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.fee_structure?.due_date ? new Date(p.fee_structure.due_date).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        p.status === 'paid' ? 'default' :
                        p.status === 'overdue' ? 'destructive' : 'secondary'
                      }>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.transaction_ref || '—'}</TableCell>
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
