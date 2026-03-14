'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { AppRole } from '@/types/database';
import { useLanguage } from '@/lib/i18n/language-context';
import type { TranslationKey } from '@/lib/i18n/translations';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BookOpen,
  CreditCard,
  Megaphone,
  BarChart3,
  Settings,
  GraduationCap,
  ChevronLeft,
  Calendar,
  UserCog,
  FileText,
  UserPlus,
  Library,
  CalendarDays,
  Bus,
  Building2,
  Package,
  Wallet,
  MessageSquare,
  Brain,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  role: AppRole;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { href: '/dashboard', labelKey: 'dashboard' as TranslationKey, icon: LayoutDashboard, roles: ['admin', 'teacher', 'parent'] },
  { href: '/students', labelKey: 'students' as TranslationKey, icon: Users, roles: ['admin', 'teacher', 'parent'] },
  { href: '/teachers', labelKey: 'teachers' as TranslationKey, icon: UserCog, roles: ['admin'] },
  { href: '/attendance', labelKey: 'attendance' as TranslationKey, icon: ClipboardCheck, roles: ['admin', 'teacher', 'parent'] },
  { href: '/timetable', labelKey: 'timetable' as TranslationKey, icon: Calendar, roles: ['admin', 'teacher', 'parent'] },
  { href: '/grades', labelKey: 'grades' as TranslationKey, icon: BookOpen, roles: ['admin', 'teacher', 'parent'] },
  { href: '/examinations', labelKey: 'exams' as TranslationKey, icon: FileText, roles: ['admin', 'teacher'] },
  { href: '/fees', labelKey: 'fees' as TranslationKey, icon: CreditCard, roles: ['admin', 'parent'] },
  { href: '/admissions', labelKey: 'admissions' as TranslationKey, icon: UserPlus, roles: ['admin'] },
  { href: '/library', labelKey: 'library' as TranslationKey, icon: Library, roles: ['admin', 'teacher', 'parent'] },
  { href: '/messages', labelKey: 'messages' as TranslationKey, icon: MessageSquare, roles: ['admin', 'teacher', 'parent'] },
  { href: '/announcements', labelKey: 'announcements' as TranslationKey, icon: Megaphone, roles: ['admin', 'teacher', 'parent'] },
  { href: '/events', labelKey: 'events' as TranslationKey, icon: CalendarDays, roles: ['admin', 'teacher', 'parent'] },
  { href: '/transport', labelKey: 'transport' as TranslationKey, icon: Bus, roles: ['admin', 'parent'] },
  { href: '/hostel', labelKey: 'hostel' as TranslationKey, icon: Building2, roles: ['admin'] },
  { href: '/inventory', labelKey: 'inventory' as TranslationKey, icon: Package, roles: ['admin'] },
  { href: '/payroll', labelKey: 'payroll' as TranslationKey, icon: Wallet, roles: ['admin'] },
  { href: '/analytics', labelKey: 'analytics' as TranslationKey, icon: Brain, roles: ['admin', 'teacher'] },
  { href: '/reports', labelKey: 'reports' as TranslationKey, icon: BarChart3, roles: ['admin', 'teacher'] },
  { href: '/settings', labelKey: 'settings' as TranslationKey, icon: Settings, roles: ['admin', 'teacher', 'parent'] },
];

export function Sidebar({ role, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border/40 bg-card/40 frost transition-all duration-300 h-screen sticky top-0',
          collapsed ? 'w-[68px]' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center h-14 border-b border-border/40 shrink-0', collapsed ? 'justify-center px-2' : 'gap-3 px-4')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm tracking-tight text-gradient">ScholarSync</span>
          )}
          <button
            onClick={onToggle}
            className={cn(
              'h-6 w-6 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground',
              collapsed ? 'mx-auto mt-2' : 'ml-auto'
            )}
          >
            <ChevronLeft className={cn('h-3.5 w-3.5 transition-transform duration-300', collapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Navigation */}
        <nav className={cn('flex-1 py-3 space-y-1 overflow-y-auto', collapsed ? 'px-2' : 'px-3')}>
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200 relative group',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80',
                  collapsed && 'justify-center px-0 w-10 h-10 mx-auto'
                )}
              >
                <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]')} />
                {!collapsed && <span>{t(item.labelKey)}</span>}
                {isActive && !collapsed && (
                  <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.6)]" />
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {t(item.labelKey)}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return linkContent;
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-3 m-3 mt-0 rounded-xl border border-border/40 bg-secondary/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_theme(colors.emerald.500/0.6)]" />
              <span className="text-[11px] font-medium text-muted-foreground">System Online</span>
            </div>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
