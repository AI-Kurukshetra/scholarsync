import { requireAuth } from '@/lib/auth';
import { AppShell } from '@/components/shared/app-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAuth();

  return <AppShell profile={profile}>{children}</AppShell>;
}
