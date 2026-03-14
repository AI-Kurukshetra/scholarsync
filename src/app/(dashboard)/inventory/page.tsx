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
import { Package, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function InventoryPage() {
  await requireRole(['admin']);
  const supabase = await createClient();

  const { data: items } = await supabase
    .from('inventory_items')
    .select('*')
    .order('name');

  const allItems = items || [];
  const totalItems = allItems.length;
  const goodCount = allItems.filter(i => i.condition === 'good').length;
  const fairCount = allItems.filter(i => i.condition === 'fair').length;
  const poorCount = allItems.filter(i => i.condition === 'poor').length;

  return (
    <>
      <PageHeader title="Inventory Management" description="Track school inventory and supplies">
        <Link href="/inventory/new">
          <Button size="sm">
            <Package className="h-4 w-4" />
            Add Item
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Items" value={totalItems} icon={Package} />
        <StatCard title="Good Condition" value={goodCount} description="Working well" icon={CheckCircle} />
        <StatCard title="Fair Condition" value={fairCount} description="Needs attention" icon={AlertTriangle} />
        <StatCard title="Poor Condition" value={poorCount} description="Requires replacement" icon={XCircle} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">All Items</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quantity</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Condition</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="text-sm font-medium">{item.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.category}</TableCell>
                    <TableCell className="text-sm font-mono">{item.quantity}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.unit}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.location}</TableCell>
                    <TableCell>
                      <Badge variant={
                        item.condition === 'good' ? 'success' :
                        item.condition === 'fair' ? 'warning' : 'destructive'
                      }>
                        {item.condition}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-mono font-semibold">${item.unit_cost?.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {allItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-12">
                      No inventory items found.
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
