'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function NewTimetableEntryPage() {
  const supabase = createClient();
  const router = useRouter();

  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; full_name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [room, setRoom] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('classes').select('id, name').order('grade_level'),
      supabase.from('subjects').select('id, name, code').order('name'),
      supabase.from('profiles').select('id, full_name').eq('role', 'teacher').order('full_name'),
    ]).then(([{ data: classData }, { data: subjectData }, { data: teacherData }]) => {
      if (classData) setClasses(classData);
      if (subjectData) setSubjects(subjectData);
      if (teacherData) setTeachers(teacherData);
    });
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !subjectId || !teacherId || !day || !startTime || !endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('timetables').insert({
      class_id: classId,
      subject_id: subjectId,
      teacher_id: teacherId,
      day,
      start_time: startTime,
      end_time: endTime,
      room: room || null,
    });

    if (error) {
      toast.error('Failed to add timetable entry');
    } else {
      toast.success('Timetable entry added successfully');
      router.push(`/timetable?class_id=${classId}`);
    }
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Add Period" description="Create a new timetable entry">
        <Button variant="outline" size="sm" asChild>
          <Link href="/timetable">Back to Timetable</Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Period Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Class *</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject *</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Teacher *</Label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Day *</Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Start Time *</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">End Time *</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Room</Label>
              <Input
                placeholder="e.g. Room 101"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={saving} size="sm">
              {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
              Save Period
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
