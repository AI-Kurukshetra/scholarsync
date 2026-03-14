import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bus, MapPin, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function TransportPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: routes } = await supabase
    .from('transport_routes')
    .select('*')
    .order('route_name');

  const gradientColors = [
    'from-violet-500 to-indigo-500',
    'from-cyan-500 to-teal-500',
    'from-pink-500 to-rose-500',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-green-500',
    'from-blue-500 to-indigo-500',
  ];

  return (
    <>
      <PageHeader title="Transport Management" description="Manage school transport routes and vehicles">
        {profile.role === 'admin' && (
          <Link href="/transport/new">
            <Button size="sm">
              <Bus className="h-4 w-4" />
              Add Route
            </Button>
          </Link>
        )}
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {routes?.map((route, i) => (
          <Card key={route.id} className="group cursor-pointer hover:ring-glow transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientColors[i % gradientColors.length]} flex items-center justify-center shadow-lg`}>
                    <Bus className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{route.route_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {route.vehicle_number}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {route.driver_name} &middot; Capacity: {route.capacity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {route.start_point} &rarr; {route.end_point}
                      </p>
                    </div>
                    {route.stops && (
                      <Badge variant="secondary" className="mt-2">
                        {Array.isArray(route.stops) ? route.stops.length : 0} stops
                      </Badge>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </CardContent>
          </Card>
        ))}
        {(!routes || routes.length === 0) && (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <p className="text-center text-sm text-muted-foreground py-8">
                No transport routes found.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
