import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
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
import { BookOpen } from 'lucide-react';

export default async function BookIssuesPage() {
  await requireAuth();
  const supabase = await createClient();

  const { data: issues } = await supabase
    .from('book_issues')
    .select('*, student:students(first_name, last_name), book:library_books(title)')
    .order('issue_date', { ascending: false });

  return (
    <>
      <PageHeader title="Book Issues" description="Track issued and returned books" />

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">All Issues</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Book</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Issue Date</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Return Date</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fine</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues?.map((issue) => (
                  <TableRow key={issue.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="text-sm font-medium">
                      {issue.student?.first_name} {issue.student?.last_name}
                    </TableCell>
                    <TableCell className="text-sm">{issue.book?.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(issue.issue_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(issue.due_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {issue.return_date ? new Date(issue.return_date).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        issue.status === 'returned' ? 'success' :
                        issue.status === 'overdue' ? 'destructive' : 'warning'
                      }>
                        {issue.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {issue.fine ? `$${issue.fine}` : '—'}
                    </TableCell>
                  </TableRow>
                ))}
                {(!issues || issues.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-12">
                      No book issues found.
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
