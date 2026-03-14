import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
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
import { Building2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function HostelAllocationsPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: allocations } = await supabase
    .from('hostel_allocations')
    .select('*, room:hostel_rooms(*), student:students(*)')
    .order('created_at', { ascending: false });

  const allAllocations = allocations || [];

  return (
    <>
      <PageHeader title="Hostel Allocations" description="View and manage room allocations">
        <div className="flex items-center gap-2">
          <Link href="/hostel">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Rooms
            </Button>
          </Link>
          {profile.role === 'admin' && (
            <Link href="/hostel/allocations/new">
              <Button size="sm">
                <Building2 className="h-4 w-4" />
                Allocate Room
              </Button>
            </Link>
          )}
        </div>
      </PageHeader>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">All Allocations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Room</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Block</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Allocated Date</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mess Opted</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allAllocations.map((allocation) => (
                  <TableRow key={allocation.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="text-sm font-medium">
                      {allocation.student?.first_name} {allocation.student?.last_name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {allocation.room?.room_number}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {allocation.room?.block}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(allocation.allocated_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={allocation.mess_opted ? 'success' : 'secondary'}>
                        {allocation.mess_opted ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={allocation.status === 'active' ? 'success' : 'destructive'}>
                        {allocation.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {allAllocations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-12">
                      No allocations found.
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
