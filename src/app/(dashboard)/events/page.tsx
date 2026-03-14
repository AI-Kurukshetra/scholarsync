import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, MapPin, Clock, User } from 'lucide-react';
import Link from 'next/link';

export default async function EventsPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: events } = await supabase
    .from('events')
    .select('*, organizer:profiles(full_name)')
    .order('event_date', { ascending: false });

  return (
    <>
      <PageHeader title="Events" description="School events and activities">
        {(profile.role === 'admin' || profile.role === 'teacher') && (
          <Button asChild size="sm">
            <Link href="/events/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Event
            </Link>
          </Button>
        )}
      </PageHeader>

      <div className="space-y-3">
        {events?.map((event) => (
          <Card key={event.id} className="group hover:ring-1 hover:ring-primary/20 transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-sm font-semibold">{event.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pl-5">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(event.event_date).toLocaleDateString()}
                      {event.start_time && ` ${event.start_time}`}
                      {event.end_time && `–${event.end_time}`}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    )}
                    {event.organizer?.full_name && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {event.organizer.full_name}
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {event.target_role === 'all' ? 'Everyone' : event.target_role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed pl-5">
                {event.description}
              </p>
            </CardContent>
          </Card>
        ))}
        {(!events || events.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No events yet.
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
