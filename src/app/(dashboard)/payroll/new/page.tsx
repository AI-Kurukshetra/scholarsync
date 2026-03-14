'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wallet, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Teacher {
  id: string;
  full_name: string;
}

export default function NewPayrollPage() {
  const router = useRouter();
  const supabase = createClient();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    teacher_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basic_salary: 0,
    allowances: 0,
    deductions: 0,
  });

  const netSalary = form.basic_salary + form.allowances - form.deductions;

  useEffect(() => {
    async function fetchTeachers() {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'teacher')
        .order('full_name');
      setTeachers(data || []);
    }
    fetchTeachers();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('payroll').insert({
      teacher_id: form.teacher_id,
      month: form.month,
      year: form.year,
      basic_salary: form.basic_salary,
      allowances: form.allowances,
      deductions: form.deductions,
      net_salary: netSalary,
      status: 'pending',
    });

    setLoading(false);
    if (!error) {
      router.push('/payroll');
    }
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <>
      <PageHeader title="Process Payroll" description="Create a new payroll entry for a staff member">
        <Link href="/payroll">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </PageHeader>

      <Card className="max-w-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">Payroll Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher</Label>
              <Select
                value={form.teacher_id}
                onValueChange={(val) => setForm({ ...form, teacher_id: val })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select
                  value={String(form.month)}
                  onValueChange={(val) => setForm({ ...form, month: Number(val) })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((name, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basic_salary">Basic Salary ($)</Label>
                <Input
                  id="basic_salary"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.basic_salary}
                  onChange={(e) => setForm({ ...form, basic_salary: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowances">Allowances ($)</Label>
                <Input
                  id="allowances"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.allowances}
                  onChange={(e) => setForm({ ...form, allowances: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deductions">Deductions ($)</Label>
                <Input
                  id="deductions"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.deductions}
                  onChange={(e) => setForm({ ...form, deductions: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Net Salary</span>
                <span className="text-xl font-bold font-mono">${netSalary.toLocaleString()}</span>
              </div>
            </div>

            <Button type="submit" disabled={loading || !form.teacher_id} className="w-full">
              {loading ? 'Processing...' : 'Submit Payroll'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
