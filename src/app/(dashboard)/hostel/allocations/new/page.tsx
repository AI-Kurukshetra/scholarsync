'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Student, HostelRoom } from '@/types/database';

export default function NewHostelAllocationPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [form, setForm] = useState({
    student_id: '',
    room_id: '',
    mess_opted: true,
    emergency_contact: '',
  });

  useEffect(() => {
    async function fetchData() {
      const [studentsRes, roomsRes] = await Promise.all([
        supabase.from('students').select('*').eq('status', 'active').order('first_name'),
        supabase.from('hostel_rooms').select('*').neq('status', 'full').order('block').order('room_number'),
      ]);
      setStudents(studentsRes.data || []);
      setRooms(roomsRes.data || []);
    }
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('hostel_allocations').insert({
      student_id: form.student_id,
      room_id: form.room_id,
      mess_opted: form.mess_opted,
      emergency_contact: form.emergency_contact || null,
    });

    setLoading(false);
    if (error) {
      toast.error('Failed to allocate room: ' + error.message);
    } else {
      toast.success('Room allocated successfully');
      router.push('/hostel/allocations');
    }
  }

  return (
    <>
      <PageHeader title="Allocate Room" description="Assign a hostel room to a student">
        <Link href="/hostel/allocations">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </PageHeader>

      <Card className="max-w-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Allocation Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <Select
                  value={form.student_id}
                  onValueChange={(val) => setForm({ ...form, student_id: val })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Room</Label>
                <Select
                  value={form.room_id}
                  onValueChange={(val) => setForm({ ...form, room_id: val })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.room_number} - Block {room.block} ({room.occupied}/{room.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input
                id="emergency_contact"
                placeholder="e.g. +1 234 567 8900"
                value={form.emergency_contact}
                onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="mess_opted"
                checked={form.mess_opted}
                onChange={(e) => setForm({ ...form, mess_opted: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="mess_opted" className="text-sm font-medium leading-none">
                Opt for Mess
              </Label>
            </div>

            <Button type="submit" disabled={loading || !form.student_id || !form.room_id} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Allocating...
                </>
              ) : (
                'Allocate Room'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
