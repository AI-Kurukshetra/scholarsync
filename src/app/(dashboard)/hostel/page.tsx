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
import { Building2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function HostelPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: rooms } = await supabase
    .from('hostel_rooms')
    .select('*')
    .order('block')
    .order('room_number');

  const allRooms = rooms || [];
  const totalRooms = allRooms.length;
  const availableCount = allRooms.filter(r => r.status === 'available').length;
  const fullCount = allRooms.filter(r => r.status === 'full').length;
  const maintenanceCount = allRooms.filter(r => r.status === 'maintenance').length;

  return (
    <>
      <PageHeader title="Hostel Management" description="Manage hostel rooms and allocations">
        {profile.role === 'admin' && (
          <div className="flex items-center gap-2">
            <Link href="/hostel/allocations">
              <Button variant="outline" size="sm">
                <Building2 className="h-4 w-4" />
                Allocations
              </Button>
            </Link>
            <Link href="/hostel/new">
              <Button size="sm">
                <Building2 className="h-4 w-4" />
                Add Room
              </Button>
            </Link>
          </div>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Rooms" value={totalRooms} icon={Building2} />
        <StatCard title="Available" value={availableCount} description="Ready for allocation" icon={CheckCircle} />
        <StatCard title="Full" value={fullCount} description="Fully occupied" icon={AlertTriangle} />
        <StatCard title="Under Maintenance" value={maintenanceCount} description="Not available" icon={XCircle} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">All Rooms</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Room Number</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Block</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Floor</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capacity</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Occupied</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allRooms.map((room) => (
                  <TableRow key={room.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="text-sm font-medium">{room.room_number}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{room.block}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{room.floor}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{room.room_type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm font-mono">{room.capacity}</TableCell>
                    <TableCell className="text-sm font-mono">{room.occupied}</TableCell>
                    <TableCell>
                      <Badge variant={
                        room.status === 'available' ? 'success' :
                        room.status === 'full' ? 'warning' : 'destructive'
                      }>
                        {room.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {allRooms.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-12">
                      No hostel rooms found.
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
