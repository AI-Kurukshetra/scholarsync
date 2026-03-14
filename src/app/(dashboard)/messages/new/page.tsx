'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

export default function NewMessagePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    recipient_id: '',
    subject: '',
    content: '',
  });

  useEffect(() => {
    async function fetchProfiles() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .neq('id', user?.id || '')
        .order('full_name');
      setProfiles(data || []);
    }
    fetchProfiles();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: form.recipient_id,
      subject: form.subject,
      content: form.content,
      read: false,
    });

    setLoading(false);
    if (!error) {
      router.push('/messages');
    }
  }

  return (
    <>
      <PageHeader title="New Message" description="Compose and send a new message">
        <Link href="/messages">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </PageHeader>

      <Card className="max-w-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Compose Message</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Select
                value={form.recipient_id}
                onValueChange={(val) => setForm({ ...form, recipient_id: val })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a recipient" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name} ({p.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter message subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your message here..."
                className="min-h-[160px] rounded-xl border-border/60 bg-secondary/50 focus-visible:ring-primary/30 focus-visible:border-primary/40"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
              />
            </div>

            <Button type="submit" disabled={loading || !form.recipient_id || !form.subject} className="w-full">
              <Send className="h-4 w-4" />
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
