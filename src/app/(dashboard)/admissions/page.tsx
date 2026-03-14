import { requireAuth } from '@/lib/auth';
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
import { Plus, ClipboardList, Eye, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function AdmissionsPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: admissions } = await supabase
    .from('admissions')
    .select('*, class_applied:classes(name)')
    .order('applied_date', { ascending: false });

  const total = admissions?.length || 0;
  const underReview = admissions?.filter(a => a.status === 'under_review').length || 0;
  const accepted = admissions?.filter(a => a.status === 'accepted').length || 0;
  const rejected = admissions?.filter(a => a.status === 'rejected').length || 0;

  const statusVariant = (status: string) => {
    switch (status) {
      case 'applied': return 'secondary';
      case 'under_review': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'destructive';
      case 'waitlisted': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <>
      <PageHeader title="Admissions" description="Manage student applications and admissions">
        {profile.role === 'admin' && (
          <Button asChild size="sm">
            <Link href="/admissions/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Application
            </Link>
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Applications" value={total} icon={ClipboardList} />
        <StatCard title="Under Review" value={underReview} icon={Eye} />
        <StatCard title="Accepted" value={accepted} icon={CheckCircle} />
        <StatCard title="Rejected" value={rejected} icon={XCircle} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">All Applications</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Applicant</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Class Applied</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Applied Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admissions?.map((a) => (
                  <TableRow key={a.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="text-sm font-medium">{a.applicant_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">{a.email}</TableCell>
                    <TableCell className="text-sm">{a.class_applied?.name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(a.status)}>
                        {a.status?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(a.applied_date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {(!admissions || admissions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-12">
                      No applications found.
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
