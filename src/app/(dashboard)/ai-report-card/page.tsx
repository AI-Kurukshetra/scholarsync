'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Star, TrendingUp, AlertTriangle, User, BookOpen, MessageSquare } from 'lucide-react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  class: { name: string }[] | { name: string } | null;
}

interface ReportCardData {
  student: { name: string; class: string; gender: string; enrollmentDate: string };
  stats: {
    attendanceRate: number;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    subjectsCount: number;
    examsCount: number;
  };
  reportCard: {
    overallGrade: string;
    gpa: string;
    narrative: string;
    subjectRemarks: { subject: string; grade: string; remark: string }[];
    strengths: string[];
    areasForImprovement: string[];
    teacherRecommendation: string;
    parentNote: string;
  };
}

export default function AIReportCardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportCardData | null>(null);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function fetchStudents() {
      const { data } = await supabase
        .from('students')
        .select('id, first_name, last_name, class:classes(name)')
        .eq('status', 'active')
        .order('first_name');
      setStudents(data || []);
    }
    fetchStudents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generateReport = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    setError('');
    setReport(null);

    try {
      const res = await fetch('/api/ai-report-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudent }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to generate report card');
      } else {
        setReport(data);
      }
    } catch {
      setError('Failed to generate report card');
    } finally {
      setLoading(false);
    }
  };

  const gradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-emerald-400';
    if (grade.startsWith('B')) return 'text-blue-400';
    if (grade.startsWith('C')) return 'text-amber-400';
    if (grade.startsWith('D')) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-gradient">AI Report Card Generator</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Generate personalized, AI-written narrative report cards based on student performance data.
        </p>
      </div>

      {/* Student selector */}
      <div className="card-glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="flex-1 h-12 rounded-xl bg-secondary/50 border border-border/40 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Select a student...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.first_name} {s.last_name} — {Array.isArray(s.class) ? s.class[0]?.name : s.class?.name || 'N/A'}
              </option>
            ))}
          </select>
          <Button
            onClick={generateReport}
            disabled={loading || !selectedStudent}
            className="h-12 px-6 rounded-xl"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
            {loading ? 'Generating...' : 'Generate Report Card'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="card-glass rounded-2xl p-4 border border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Report Card */}
      {report && (
        <div className="space-y-4">
          {/* Header */}
          <div className="card-glass rounded-2xl p-6 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{report.student.name}</h2>
                  <p className="text-sm text-muted-foreground">Class {report.student.class} | Enrolled {report.student.enrollmentDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className={`text-3xl font-black ${gradeColor(report.reportCard.overallGrade)}`}>
                    {report.reportCard.overallGrade}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Grade</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-primary">{report.reportCard.gpa}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">GPA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Attendance', value: `${report.stats.attendanceRate}%`, sub: `${report.stats.presentDays}/${report.stats.totalDays} days` },
              { label: 'Absent Days', value: report.stats.absentDays, sub: `${report.stats.lateDays} late` },
              { label: 'Subjects', value: report.stats.subjectsCount, sub: 'graded' },
              { label: 'Exams', value: report.stats.examsCount, sub: 'completed' },
            ].map((stat) => (
              <div key={stat.label} className="card-glass rounded-xl p-4 text-center">
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-[10px] text-muted-foreground/60">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Narrative */}
          <div className="card-glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Narrative Assessment</h3>
            </div>
            <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {report.reportCard.narrative}
            </div>
          </div>

          {/* Subject Remarks */}
          {report.reportCard.subjectRemarks?.length > 0 && (
            <div className="card-glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Subject Performance</h3>
              <div className="space-y-3">
                {report.reportCard.subjectRemarks.map((sr, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30">
                    <span className={`text-lg font-bold ${gradeColor(sr.grade)} min-w-[2rem]`}>{sr.grade}</span>
                    <div>
                      <div className="text-sm font-medium">{sr.subject}</div>
                      <div className="text-xs text-muted-foreground">{sr.remark}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Areas */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card-glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-amber-400" />
                <h3 className="font-semibold">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {report.reportCard.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h3 className="font-semibold">Areas for Improvement</h3>
              </div>
              <ul className="space-y-2">
                {report.reportCard.areasForImprovement?.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Teacher Recommendation & Parent Note */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card-glass rounded-2xl p-6 border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Teacher Recommendation</h3>
              </div>
              <p className="text-sm text-muted-foreground">{report.reportCard.teacherRecommendation}</p>
            </div>
            <div className="card-glass rounded-2xl p-6 border border-accent/20">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-accent" />
                <h3 className="font-semibold">Note to Parents</h3>
              </div>
              <p className="text-sm text-muted-foreground">{report.reportCard.parentNote}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
