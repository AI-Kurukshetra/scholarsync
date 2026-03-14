'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NewAdmissionPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    supabase.from('classes').select('id, name').order('grade_level').then(({ data }) => {
      if (data) setClasses(data);
    });
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from('admissions').insert({
      applicant_name: formData.get('applicant_name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      date_of_birth: formData.get('date_of_birth') as string,
      gender: formData.get('gender') as string,
      class_applied: formData.get('class_applied') as string,
      parent_name: formData.get('parent_name') as string,
      parent_phone: formData.get('parent_phone') as string,
      previous_school: formData.get('previous_school') as string,
      notes: formData.get('notes') as string,
      status: 'applied',
      applied_date: new Date().toISOString().split('T')[0],
    });

    if (error) {
      toast.error('Failed to submit application');
      setLoading(false);
      return;
    }

    toast.success('Application submitted');
    router.push('/admissions');
    router.refresh();
  };

  return (
    <>
      <PageHeader title="New Application" description="Submit a new admission application" />

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Applicant Name</Label>
                <Input name="applicant_name" required placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="email" required placeholder="email@example.com" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input name="phone" type="tel" placeholder="Phone number" />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input name="date_of_birth" type="date" required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select name="gender" defaultValue="male">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class Applied</Label>
                <Select name="class_applied">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Parent/Guardian Name</Label>
                <Input name="parent_name" required placeholder="Parent full name" />
              </div>
              <div className="space-y-2">
                <Label>Parent/Guardian Phone</Label>
                <Input name="parent_phone" type="tel" placeholder="Parent phone number" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Previous School</Label>
              <Input name="previous_school" placeholder="Previous school name (optional)" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea name="notes" rows={3} placeholder="Any additional notes..." />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
