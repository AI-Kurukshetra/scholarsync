import { Card, CardContent } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
}

const iconColors = [
  'from-violet-500 to-indigo-500',
  'from-cyan-500 to-teal-500',
  'from-pink-500 to-rose-500',
  'from-amber-500 to-orange-500',
];

let colorIndex = 0;

export function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  const gradient = iconColors[colorIndex++ % iconColors.length];

  return (
    <Card className="group hover:ring-glow overflow-hidden">
      <CardContent className="pt-5 relative">
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br opacity-[0.07] blur-xl group-hover:opacity-[0.12] transition-opacity" style={{background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`}} />
        <div className="flex items-start gap-4">
          <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold tracking-tight mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1.5">{description}</p>
            )}
            {trend && (
              <div className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                trend.value >= 0
                  ? 'text-emerald-500 bg-emerald-500/10'
                  : 'text-red-500 bg-red-500/10'
              }`}>
                <span>{trend.value >= 0 ? '+' : ''}{trend.value}%</span>
                <span className="font-normal text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
