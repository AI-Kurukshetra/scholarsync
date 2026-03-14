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
import { CreditCard, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function FeesPage() {
  await requireAuth();
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from('fee_payments')
    .select('*, student:students(id, first_name, last_name, class:classes(name)), fee_structure:fee_structures(name, amount)')
    .order('created_at', { ascending: false });

  const paid = payments?.filter(p => p.status === 'paid') || [];
  const pending = payments?.filter(p => p.status === 'pending') || [];
  const overdue = payments?.filter(p => p.status === 'overdue') || [];
  const totalCollected = paid.reduce((sum, p) => sum + p.amount_paid, 0);
  const totalPending = pending.reduce((sum, p) => sum + (p.fee_structure?.amount || 0) - p.amount_paid, 0);

  return (
    <>
      <PageHeader title="Fee Management" description="Track and manage student fee payments" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Collected" value={`$${totalCollected.toLocaleString()}`} icon={CreditCard} trend={{ value: 8, label: 'this month' }} />
        <StatCard title="Paid" value={paid.length} description="Fully paid" icon={CheckCircle} />
        <StatCard title="Pending" value={pending.length} description={`$${totalPending.toLocaleString()} outstanding`} icon={Clock} />
        <StatCard title="Overdue" value={overdue.length} icon={AlertTriangle} trend={{ value: overdue.length > 0 ? -5 : 0, label: 'vs last month' }} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">All Payments</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Class</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fee Type</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paid</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.map((p) => (
                  <TableRow key={p.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell>
                      <Link href={`/fees/${p.student?.id}`} className="text-sm font-medium hover:text-primary transition-colors">
                        {p.student?.first_name} {p.student?.last_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.student?.class?.name}</TableCell>
                    <TableCell className="text-sm">{p.fee_structure?.name}</TableCell>
                    <TableCell className="text-sm font-mono font-semibold">${p.fee_structure?.amount}</TableCell>
                    <TableCell className="text-sm font-mono">${p.amount_paid}</TableCell>
                    <TableCell>
                      <Badge variant={
                        p.status === 'paid' ? 'success' :
                        p.status === 'overdue' ? 'destructive' : 'warning'
                      }>
                        {p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!payments || payments.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-12">
                      No fee records found.
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
