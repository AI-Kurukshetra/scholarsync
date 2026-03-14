import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, BookOpen, Mail } from 'lucide-react';

const avatarGradients = [
  'from-violet-500 to-indigo-500',
  'from-cyan-500 to-teal-500',
  'from-pink-500 to-rose-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-green-500',
  'from-blue-500 to-sky-500',
  'from-fuchsia-500 to-purple-500',
  'from-red-500 to-pink-500',
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default async function TeachersPage() {
  await requireRole(['admin']);
  const supabase = await createClient();

  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, created_at')
    .eq('role', 'teacher')
    .order('full_name');

  const { data: classes } = await supabase
    .from('classes')
    .select('id, teacher_id');

  const teacherClassCounts: Record<string, number> = {};
  classes?.forEach((c) => {
    if (c.teacher_id) {
      teacherClassCounts[c.teacher_id] = (teacherClassCounts[c.teacher_id] || 0) + 1;
    }
  });

  const totalTeachers = teachers?.length || 0;
  const teachersWithClasses = Object.keys(teacherClassCounts).length;
  const totalAssignments = Object.values(teacherClassCounts).reduce((sum, c) => sum + c, 0);

  return (
    <>
      <PageHeader title="Teachers" description="Manage and view all teaching staff" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Teachers" value={totalTeachers} description="Active staff" icon={GraduationCap} />
        <StatCard title="With Classes" value={teachersWithClasses} description="Currently assigned" icon={BookOpen} />
        <StatCard title="Total Assignments" value={totalAssignments} description="Class assignments" icon={Users} />
      </div>

      {teachers && teachers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher, index) => {
            const gradient = avatarGradients[index % avatarGradients.length];
            const classCount = teacherClassCounts[teacher.id] || 0;

            return (
              <Card key={teacher.id} className="group hover:ring-glow overflow-hidden">
                <CardContent className="pt-5 relative">
                  <div
                    className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] blur-xl group-hover:opacity-[0.12] transition-opacity"
                    style={{ background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))` }}
                  />
                  <div className="flex items-start gap-4">
                    <div
                      className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
                    >
                      <span className="text-sm font-bold text-white">{getInitials(teacher.full_name)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{teacher.full_name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground truncate">{teacher.email}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant={classCount > 0 ? 'default' : 'secondary'}>
                          {classCount} {classCount === 1 ? 'class' : 'classes'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <p className="text-sm text-muted-foreground text-center">No teachers found.</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
