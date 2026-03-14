'use client';

import { useTheme } from '@/components/shared/theme-provider';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Sun, Moon, Monitor, Check, Sparkles, Info } from 'lucide-react';

const themes = [
  { value: 'light' as const, label: 'Light', icon: Sun, gradient: 'from-amber-500 to-orange-500' },
  { value: 'dark' as const, label: 'Dark', icon: Moon, gradient: 'from-violet-500 to-indigo-500' },
  { value: 'system' as const, label: 'System', icon: Monitor, gradient: 'from-cyan-500 to-teal-500' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <PageHeader title="Settings" description="Manage your preferences" />

      <Card className="max-w-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Appearance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label className="text-sm">Theme</Label>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => {
              const IconComp = t.icon;
              const isActive = theme === t.value;
              return (
                <button
                  key={t.value}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-all duration-200 cursor-pointer',
                    isActive
                      ? 'border-primary/50 bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/20 shadow-sm'
                      : 'border-border/60 hover:bg-secondary/50 hover:border-border'
                  )}
                  onClick={() => setTheme(t.value)}
                >
                  <div className="relative">
                    <div className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                      isActive
                        ? `bg-gradient-to-br ${t.gradient} shadow-lg`
                        : 'bg-secondary'
                    )}>
                      <IconComp className={cn('h-4 w-4', isActive ? 'text-white' : 'text-muted-foreground')} />
                    </div>
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <span className={cn('text-xs font-medium', isActive ? 'text-primary' : 'text-muted-foreground')}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-accent" />
            <CardTitle className="text-sm font-medium text-muted-foreground">About</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">ScholarSync v1.0</p>
              <p className="text-xs text-muted-foreground mt-0.5">Built with Next.js, Supabase, and shadcn/ui</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
