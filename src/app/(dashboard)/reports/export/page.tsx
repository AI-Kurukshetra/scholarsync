'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Users, CreditCard, ClipboardCheck, BookOpen, Loader2 } from 'lucide-react';

const exportOptions = [
  { key: 'students', label: 'Students', description: 'Export all student records', icon: Users, gradient: 'from-violet-500 to-indigo-500', table: 'students', columns: ['first_name', 'last_name', 'email', 'date_of_birth', 'gender', 'enrollment_date', 'status'] },
  { key: 'attendance', label: 'Attendance', description: 'Export attendance records', icon: ClipboardCheck, gradient: 'from-cyan-500 to-teal-500', table: 'attendance', columns: ['student_id', 'class_id', 'date', 'status'] },
  { key: 'grades', label: 'Grades', description: 'Export grade records', icon: BookOpen, gradient: 'from-pink-500 to-rose-500', table: 'grades', columns: ['student_id', 'assignment_id', 'score', 'remarks'] },
  { key: 'payments', label: 'Fee Payments', description: 'Export payment records', icon: CreditCard, gradient: 'from-amber-500 to-orange-500', table: 'fee_payments', columns: ['student_id', 'fee_structure_id', 'amount_paid', 'payment_date', 'status', 'transaction_ref'] },
];

export default function ExportPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (option: typeof exportOptions[0]) => {
    setLoading(option.key);
    const { data, error } = await supabase.from(option.table).select(option.columns.join(', '));

    if (error || !data) {
      setLoading(null);
      return;
    }

    const headers = option.columns.join(',');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (data as any[]).map((row) =>
      option.columns.map(col => {
        const val = row[col];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') ? `"${str}"` : str;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${option.key}_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(null);
  };

  return (
    <>
      <PageHeader title="Export Data" description="Download data as CSV files" />

      <div className="grid gap-4 sm:grid-cols-2">
        {exportOptions.map((option) => (
          <Card key={option.key}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                  <option.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => handleExport(option)}
                    disabled={loading === option.key}
                  >
                    {loading === option.key ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
