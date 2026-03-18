import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReportCardClient } from './report-card-client';

export default async function AIReportCardPage() {
  await requireAuth();
  const supabase = await createClient();

  const { data: students } = await supabase
    .from('students')
    .select('id, first_name, last_name, class:classes(name)')
    .eq('status', 'active')
    .order('first_name');

  const studentList = (students || []).map(s => ({
    id: s.id,
    first_name: s.first_name,
    last_name: s.last_name,
    className: Array.isArray(s.class) ? s.class[0]?.name || 'N/A' : (s.class as { name: string } | null)?.name || 'N/A',
  }));

  return <ReportCardClient students={studentList} />;
}
