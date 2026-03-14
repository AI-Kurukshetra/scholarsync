'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';
import { useTheme } from './theme-provider';
import { useLanguage } from '@/lib/i18n/language-context';
import type { TranslationKey } from '@/lib/i18n/translations';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Moon, Sun, LogOut, Settings, GraduationCap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BookOpen,
  CreditCard,
  Megaphone,
  BarChart3,
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

interface TopbarProps {
  profile: Profile;
}

export function Topbar({ profile }: TopbarProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(profile.role)
  );

  const roleBadge = profile.role === 'admin' ? 'bg-primary/10 text-primary' :
    profile.role === 'teacher' ? 'bg-accent/10 text-accent' : 'bg-amber-500/10 text-amber-500';

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/60 frost">
      <div className="flex h-14 items-center gap-4 px-4">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0 bg-card/95 frost border-border/40">
            <div className="flex items-center gap-3 px-4 h-14 border-b border-border/40">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm text-gradient">ScholarSync</span>
            </div>
            <nav className="px-3 py-3 space-y-1">
              {filteredItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex-1" />

        {/* Role badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider ${roleBadge}`}>
          <Sparkles className="h-3 w-3" />
          {profile.role}
        </div>

        {/* Language toggle */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'hi' : 'en')}
          className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground text-xs font-semibold"
        >
          {locale === 'en' ? 'हि' : 'EN'}
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 h-8 pl-1 pr-2.5 rounded-xl hover:bg-secondary transition-colors">
              <Avatar className="h-6 w-6 ring-2 ring-primary/20">
                <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary to-accent text-white font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-[13px] font-medium">{profile.full_name}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl border-border/60 frost bg-card/95">
            <DropdownMenuLabel className="font-normal">
              <div className="text-sm font-semibold">{profile.full_name}</div>
              <div className="text-xs text-muted-foreground capitalize">{profile.role}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="rounded-lg">
              <Link href="/settings">
                <Settings className="mr-2 h-3.5 w-3.5" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="rounded-lg text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
