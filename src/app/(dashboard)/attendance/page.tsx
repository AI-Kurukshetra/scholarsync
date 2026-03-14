'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Save, ClipboardCheck, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface StudentRecord {
  id: string;
  first_name: string;
  last_name: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

const statusVariant = {
  present: 'success' as const,
  absent: 'destructive' as const,
  late: 'warning' as const,
  excused: 'secondary' as const,
};

export default function AttendancePage() {
  const supabase = createClient();
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('classes').select('id, name').order('grade_level').then(({ data }) => {
      if (data) setClasses(data);
    });
  }, [supabase]);

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);

    Promise.all([
      supabase.from('students').select('id, first_name, last_name').eq('class_id', selectedClass).eq('status', 'active').order('last_name'),
      supabase.from('attendance').select('student_id, status').eq('class_id', selectedClass).eq('date', date),
    ]).then(([{ data: studentData }, { data: attendanceData }]) => {
      const records: StudentRecord[] = (studentData || []).map((s) => {
        const existing = attendanceData?.find((a) => a.student_id === s.id);
        return {
          id: s.id,
          first_name: s.first_name,
          last_name: s.last_name,
          status: (existing?.status as StudentRecord['status']) || 'present',
        };
      });
      setStudents(records);
      setLoading(false);
    });
  }, [selectedClass, date, supabase]);

  const toggleStatus = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, status: s.status === 'present' ? 'absent' : s.status === 'absent' ? 'late' : s.status === 'late' ? 'excused' : 'present' }
          : s
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    await supabase.from('attendance').delete().eq('class_id', selectedClass).eq('date', date);

    const records = students.map((s) => ({
      student_id: s.id,
      class_id: selectedClass,
      date,
      status: s.status,
      marked_by: user.id,
    }));

    const { error } = await supabase.from('attendance').insert(records);

    if (error) {
      toast.error('Failed to save attendance');
    } else {
      toast.success('Attendance saved successfully');
    }
    setSaving(false);
  };

  const presentCount = students.filter((s) => s.status === 'present' || s.status === 'late').length;
  const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <>
      <PageHeader title="Attendance" description="Mark and manage daily attendance">
        <Button variant="outline" size="sm" asChild>
          <Link href="/attendance/reports">View Reports</Link>
        </Button>
      </PageHeader>

      {selectedClass && students.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="bg-secondary/20">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-secondary/20">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <ClipboardCheck className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{presentCount}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-secondary/20">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{attendanceRate}%</p>
                <p className="text-xs text-muted-foreground">Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Mark Attendance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full sm:w-48 h-9 text-sm">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex h-9 rounded-xl border border-border/60 bg-secondary/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>

          {selectedClass && students.length > 0 && (
            <>
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-12">#</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, i) => (
                      <TableRow key={student.id} className="hover:bg-secondary/20 transition-colors">
                        <TableCell className="text-xs text-muted-foreground font-mono">{i + 1}</TableCell>
                        <TableCell className="text-sm font-medium">{student.first_name} {student.last_name}</TableCell>
                        <TableCell>
                          <button onClick={() => toggleStatus(student.id)} className="cursor-pointer">
                            <Badge variant={statusVariant[student.status]}>{student.status}</Badge>
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                Save Attendance
              </Button>
            </>
          )}

          {selectedClass && !loading && students.length === 0 && (
            <p className="text-sm text-muted-foreground py-12 text-center">No students found in this class.</p>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
