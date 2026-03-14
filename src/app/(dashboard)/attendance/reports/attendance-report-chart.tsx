'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartData {
  date: string;
  present: number;
  absent: number;
  rate: number;
}

export function AttendanceReportChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
          }}
        />
        <Line type="monotone" dataKey="present" stroke="hsl(142, 76%, 36%)" strokeWidth={2} />
        <Line type="monotone" dataKey="absent" stroke="hsl(0, 84%, 60%)" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
