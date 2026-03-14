'use client';

import { useState } from 'react';
import type { Profile } from '@/types/database';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

interface AppShellProps {
  profile: Profile;
  children: React.ReactNode;
}

export function AppShell({ profile, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background mesh-gradient">
      <Sidebar
        role={profile.role}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar profile={profile} />
        <main className="flex-1 p-4 md:p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
