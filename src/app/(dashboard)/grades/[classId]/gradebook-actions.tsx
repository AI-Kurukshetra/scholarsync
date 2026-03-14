'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  classSubjectIds: string[];
}

export function GradebookActions({ classSubjectIds }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from('assignments').insert({
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      class_subject_id: formData.get('class_subject_id') as string,
      due_date: formData.get('due_date') as string,
      max_score: parseInt(formData.get('max_score') as string),
      created_by: (await supabase.auth.getUser()).data.user?.id,
    });

    if (error) {
      toast.error('Failed to create assignment');
    } else {
      toast.success('Assignment created');
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Assignment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Assignment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input name="title" required />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input name="description" />
          </div>
          <div className="space-y-2">
            <Label>Class Subject</Label>
            <Select name="class_subject_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {classSubjectIds.map((id) => (
                  <SelectItem key={id} value={id}>{id.slice(0, 8)}...</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input name="due_date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label>Max Score</Label>
              <Input name="max_score" type="number" defaultValue={100} required />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
