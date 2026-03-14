'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AttendanceRecord {
  status: string;
}

export function DashboardCharts({ attendanceData }: { attendanceData: AttendanceRecord[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const chunkSize = Math.ceil(attendanceData.length / days.length);

  const chartData = days.map((day, i) => {
    const chunk = attendanceData.slice(i * chunkSize, (i + 1) * chunkSize);
    const present = chunk.filter(a => a.status === 'present' || a.status === 'late').length;
    const absent = chunk.filter(a => a.status === 'absent').length;
    return { day, present, absent };
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" vertical={false} />
        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border) / 0.6)',
            borderRadius: '12px',
            fontSize: '12px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        />
        <Area
          type="monotone"
          dataKey="present"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#presentGradient)"
          dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
          activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="absent"
          stroke="hsl(var(--chart-4))"
          strokeWidth={2}
          fill="url(#absentGradient)"
          dot={{ r: 4, fill: 'hsl(var(--chart-4))', strokeWidth: 0 }}
          activeDot={{ r: 6, fill: 'hsl(var(--chart-4))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
