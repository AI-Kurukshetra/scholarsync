import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, ChevronRight, Users } from 'lucide-react';

export default async function GradesPage() {
  await requireAuth();
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, grade_level, section, teacher_id')
    .order('grade_level');

  const teacherIds = classes?.map(c => c.teacher_id).filter(Boolean) || [];
  const { data: teachers } = teacherIds.length > 0
    ? await supabase.from('profiles').select('id, full_name').in('id', teacherIds)
    : { data: [] };
  const teacherMap = new Map(teachers?.map(t => [t.id, t.full_name]) || []);

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
      <PageHeader title="Grades" description="Manage student grades and assignments" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {classes?.map((cls, i) => (
          <Link key={cls.id} href={`/grades/${cls.id}`}>
            <Card className="group cursor-pointer hover:ring-glow transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientColors[i % gradientColors.length]} flex items-center justify-center shadow-lg`}>
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{cls.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Grade {cls.grade_level} &middot; Section {cls.section}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {(cls.teacher_id && teacherMap.get(cls.teacher_id)) || 'No teacher assigned'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
