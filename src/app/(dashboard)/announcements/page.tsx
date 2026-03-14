import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Pin, Megaphone } from 'lucide-react';
import Link from 'next/link';

export default async function AnnouncementsPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, author:profiles(full_name), target_class:classes(name)')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <>
      <PageHeader title="Announcements" description="School announcements and notices">
        {(profile.role === 'admin' || profile.role === 'teacher') && (
          <Button asChild size="sm">
            <Link href="/announcements/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Announcement
            </Link>
          </Button>
        )}
      </PageHeader>

      <div className="space-y-3">
        {announcements?.map((a) => (
          <Card key={a.id} className={a.is_pinned ? 'ring-1 ring-primary/30 bg-primary/[0.02]' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {a.is_pinned ? (
                      <Pin className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Megaphone className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <h3 className="text-sm font-semibold">{a.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground pl-5">
                    {a.author?.full_name} &middot; {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Badge variant="outline" className="text-[10px]">{a.target_role === 'all' ? 'Everyone' : a.target_role}</Badge>
                  {a.target_class && <Badge variant="secondary" className="text-[10px]">{a.target_class.name}</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed pl-5">{a.content}</p>
            </CardContent>
          </Card>
        ))}
        {(!announcements || announcements.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No announcements yet.
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
