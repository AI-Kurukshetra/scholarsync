import { requireAuth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardCheck, BookOpen, CreditCard, ChevronRight, Users, FileText, UserPlus, Library, Bus, Wallet, Download, Upload } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const reports = [
  {
    title: 'Attendance Report',
    description: 'View attendance trends and patterns across classes and dates.',
    href: '/attendance/reports',
    icon: ClipboardCheck,
    gradient: 'from-violet-500 to-indigo-500',
  },
  {
    title: 'Grade Summary',
    description: 'Review grade distributions and class performance.',
    href: '/grades',
    icon: BookOpen,
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    title: 'Fee Collection',
    description: 'Track fee payments, outstanding balances, and collection rates.',
    href: '/fees',
    icon: CreditCard,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Student Report',
    description: 'Student enrollment, demographics, and class distribution.',
    href: '/students',
    icon: Users,
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    title: 'Examination Results',
    description: 'Exam scores, pass rates, and performance analytics.',
    href: '/examinations',
    icon: FileText,
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    title: 'Admissions Report',
    description: 'Application status, acceptance rates, and enrollment pipeline.',
    href: '/admissions',
    icon: UserPlus,
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    title: 'Library Usage',
    description: 'Book circulation, popular titles, and overdue tracking.',
    href: '/library',
    icon: Library,
    gradient: 'from-purple-500 to-violet-500',
  },
  {
    title: 'Transport Report',
    description: 'Route utilization, vehicle capacity, and student assignments.',
    href: '/transport',
    icon: Bus,
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    title: 'Payroll Summary',
    description: 'Salary disbursements, deductions, and payment history.',
    href: '/payroll',
    icon: Wallet,
    gradient: 'from-orange-500 to-red-500',
  },
];

export default async function ReportsPage() {
  await requireAuth();

  return (
    <>
      <PageHeader title="Reports" description="Access various school reports">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/reports/import">
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Import Data
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/reports/export">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export Data
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Link key={report.href} href={report.href}>
            <Card className="group cursor-pointer hover:ring-glow transition-all duration-300 h-full">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${report.gradient} flex items-center justify-center shadow-lg`}>
                    <report.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{report.title}</p>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{report.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
