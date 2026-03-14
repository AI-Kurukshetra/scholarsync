'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewExaminationPage() {
  const supabase = createClient();
  const router = useRouter();

  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [room, setRoom] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('classes').select('id, name').order('grade_level'),
      supabase.from('subjects').select('id, name, code').order('name'),
    ]).then(([{ data: classData }, { data: subjectData }]) => {
      if (classData) setClasses(classData);
      if (subjectData) setSubjects(subjectData);
    });
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !classId || !subjectId || !date || !maxMarks) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('examinations').insert({
      name,
      class_id: classId,
      subject_id: subjectId,
      date,
      start_time: startTime || null,
      end_time: endTime || null,
      max_marks: parseInt(maxMarks),
      room: room || null,
    });

    if (error) {
      toast.error('Failed to create examination');
    } else {
      toast.success('Examination created successfully');
      router.push('/examinations');
    }
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Create Examination" description="Schedule a new examination">
        <Button variant="outline" size="sm" asChild>
          <Link href="/examinations">Back to Examinations</Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Exam Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Exam Name *</Label>
              <Input
                placeholder="e.g. Mid-Term Mathematics"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date *</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Start Time</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">End Time</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max Marks *</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Room</Label>
                <Input
                  placeholder="e.g. Hall A"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" disabled={saving} size="sm">
              {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
              Create Examination
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
