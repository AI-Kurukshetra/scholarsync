import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Wallet, CheckCircle, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default async function PayrollPage() {
  await requireRole(['admin']);
  const supabase = await createClient();

  const { data: payrollRecords } = await supabase
    .from('payroll')
    .select('*, profile:profiles(id, full_name)')
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  const records = payrollRecords || [];
  const totalPayroll = records.reduce((sum, r) => sum + (r.net_salary || 0), 0);
  const paidCount = records.filter(r => r.status === 'paid').length;
  const pendingCount = records.filter(r => r.status === 'pending').length;
  const processedCount = records.filter(r => r.status === 'processed').length;

  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <>
      <PageHeader title="Staff Payroll" description="Manage staff salary payments and records">
        <Link href="/payroll/new">
          <Button size="sm">
            <Wallet className="h-4 w-4" />
            Process Payroll
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Payroll" value={`$${totalPayroll.toLocaleString()}`} icon={DollarSign} />
        <StatCard title="Paid" value={paidCount} description="Completed payments" icon={CheckCircle} />
        <StatCard title="Pending" value={pendingCount} description="Awaiting processing" icon={Clock} />
        <StatCard title="Processed" value={processedCount} description="Ready for disbursement" icon={Wallet} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Payroll Records</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Teacher</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Period</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Basic Salary</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Allowances</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deductions</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Salary</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="text-sm font-medium">
                      {r.profile?.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {monthNames[r.month]} {r.year}
                    </TableCell>
                    <TableCell className="text-sm font-mono font-semibold">${r.basic_salary?.toLocaleString()}</TableCell>
                    <TableCell className="text-sm font-mono text-emerald-500">${r.allowances?.toLocaleString()}</TableCell>
                    <TableCell className="text-sm font-mono text-red-500">${r.deductions?.toLocaleString()}</TableCell>
                    <TableCell className="text-sm font-mono font-semibold">${r.net_salary?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        r.status === 'paid' ? 'success' :
                        r.status === 'processed' ? 'warning' : 'secondary'
                      }>
                        {r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {records.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-12">
                      No payroll records found.
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
