'use client';

import type { AppRole } from '@/types/database';

interface RoleGateProps {
  role: AppRole;
  allowed: AppRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ role, allowed, children, fallback = null }: RoleGateProps) {
  if (!allowed.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
