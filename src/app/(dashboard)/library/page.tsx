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
import { Plus, BookOpen, BookCheck, BookX, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function LibraryPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: books } = await supabase
    .from('library_books')
    .select('*')
    .order('title', { ascending: true });

  const totalBooks = books?.length || 0;
  const available = books?.filter(b => b.available_copies > 0).length || 0;
  const issued = books?.filter(b => b.available_copies < b.total_copies).length || 0;
  const overdue = books?.filter(b => b.status === 'overdue').length || 0;

  return (
    <>
      <PageHeader title="Library" description="Manage books and library resources">
        {profile.role === 'admin' && (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/library/issues">
                <BookX className="mr-1.5 h-3.5 w-3.5" />
                Book Issues
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/library/new">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Book
              </Link>
            </Button>
          </div>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Books" value={totalBooks} icon={BookOpen} />
        <StatCard title="Available" value={available} icon={BookCheck} />
        <StatCard title="Issued" value={issued} icon={BookX} />
        <StatCard title="Overdue" value={overdue} icon={AlertTriangle} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">All Books</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Author</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ISBN</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Copies</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books?.map((book) => (
                  <TableRow key={book.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="text-sm font-medium">{book.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{book.author}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">{book.isbn}</TableCell>
                    <TableCell className="text-sm">{book.category}</TableCell>
                    <TableCell className="text-sm font-mono">
                      {book.available_copies}/{book.total_copies}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        book.available_copies > 0 ? 'success' :
                        book.status === 'overdue' ? 'destructive' : 'warning'
                      }>
                        {book.available_copies > 0 ? 'available' : book.status || 'issued'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!books || books.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-12">
                      No books found.
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
