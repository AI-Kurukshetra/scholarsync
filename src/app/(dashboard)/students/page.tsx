import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const profile = await requireAuth();
  const supabase = await createClient();
  const params = await searchParams;
  const search = params.search || '';
  const page = parseInt(params.page || '1');
  const perPage = 10;

  let query = supabase
    .from('students')
    .select('*, class:classes(name)', { count: 'exact' })
    .order('last_name', { ascending: true });

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: students, count } = await query.range(
    (page - 1) * perPage,
    page * perPage - 1
  );

  const totalPages = Math.ceil((count || 0) / perPage);

  return (
    <>
      <PageHeader title="Students" description="Manage student records">
        {(profile.role === 'admin' || profile.role === 'teacher') && (
          <Button asChild size="sm">
            <Link href="/students/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Student
            </Link>
          </Button>
        )}
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <form className="mb-4">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search students..."
                defaultValue={search}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </form>

          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Class</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Enrolled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.map((student) => (
                  <TableRow key={student.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell>
                      <Link href={`/students/${student.id}`} className="text-sm font-medium hover:text-primary transition-colors">
                        {student.first_name} {student.last_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">{student.email}</TableCell>
                    <TableCell className="text-sm">{student.class?.name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'active' ? 'success' : 'secondary'}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(student.enrollment_date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {(!students || students.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-12">
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">
                {(page - 1) * perPage + 1}–{Math.min(page * perPage, count || 0)} of {count}
              </p>
              <div className="flex gap-1.5">
                {page > 1 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/students?search=${search}&page=${page - 1}`}>Previous</Link>
                  </Button>
                )}
                {page < totalPages && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/students?search=${search}&page=${page + 1}`}>Next</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
