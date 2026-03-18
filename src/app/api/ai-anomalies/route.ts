import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Fetch recent data for anomaly detection
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [
      { data: recentAttendance },
      { data: olderAttendance },
      { data: recentGrades },
      { data: feePayments },
      { data: overdueBooks },
      { data: students },
    ] = await Promise.all([
      // Last 7 days attendance
      supabase
        .from('attendance')
        .select('student_id, status, date')
        .gte('date', sevenDaysAgo),
      // Previous 23 days (for comparison)
      supabase
        .from('attendance')
        .select('student_id, status, date')
        .gte('date', thirtyDaysAgo)
        .lt('date', sevenDaysAgo),
      // Recent grades
      supabase
        .from('grades')
        .select('student_id, score, assignment:assignments(max_score, title)')
        .order('created_at', { ascending: false })
        .limit(200),
      // Overdue fees
      supabase
        .from('fee_payments')
        .select('student_id, amount_paid, status, fee_structure:fee_structures(name, amount, due_date)')
        .eq('status', 'overdue'),
      // Overdue books
      supabase
        .from('book_issues')
        .select('student_id, due_date, book:library_books(title)')
        .eq('status', 'overdue'),
      // Active students with class info
      supabase
        .from('students')
        .select('id, first_name, last_name, class:classes(name)')
        .eq('status', 'active'),
    ]);

    const studentMap = new Map((students || []).map(s => [s.id, `${s.first_name} ${s.last_name} (${(s.class as any)?.name || 'N/A'})`]));

    // Detect attendance anomalies: students whose recent attendance dropped significantly
    const recentAttByStudent = new Map<string, { present: number; total: number }>();
    const olderAttByStudent = new Map<string, { present: number; total: number }>();

    for (const a of recentAttendance || []) {
      const curr = recentAttByStudent.get(a.student_id) || { present: 0, total: 0 };
      curr.total++;
      if (a.status === 'present') curr.present++;
      recentAttByStudent.set(a.student_id, curr);
    }

    for (const a of olderAttendance || []) {
      const curr = olderAttByStudent.get(a.student_id) || { present: 0, total: 0 };
      curr.total++;
      if (a.status === 'present') curr.present++;
      olderAttByStudent.set(a.student_id, curr);
    }

    const attendanceDrops: string[] = [];
    for (const [studentId, recent] of Array.from(recentAttByStudent.entries())) {
      const older = olderAttByStudent.get(studentId);
      if (older && older.total >= 5 && recent.total >= 3) {
        const recentRate = (recent.present / recent.total) * 100;
        const olderRate = (older.present / older.total) * 100;
        const drop = olderRate - recentRate;
        if (drop > 20) {
          const name = studentMap.get(studentId) || studentId;
          attendanceDrops.push(`${name}: dropped from ${Math.round(olderRate)}% to ${Math.round(recentRate)}% (-${Math.round(drop)}%)`);
        }
      }
    }

    // Detect grade anomalies: students scoring below 40% on recent assignments
    const lowGrades: string[] = [];
    for (const g of recentGrades || []) {
      const maxScore = (g.assignment as any)?.max_score || 100;
      const percentage = (Number(g.score) / maxScore) * 100;
      if (percentage < 40) {
        const name = studentMap.get(g.student_id) || g.student_id;
        const title = (g.assignment as any)?.title || 'Unknown';
        lowGrades.push(`${name}: scored ${Math.round(percentage)}% on "${title}"`);
      }
    }

    // Fee anomalies
    const overdueFees = (feePayments || []).map(f => {
      const name = studentMap.get(f.student_id) || f.student_id;
      const feeName = (f.fee_structure as any)?.name || 'Unknown';
      const amount = (f.fee_structure as any)?.amount || 0;
      return `${name}: ${feeName} — $${amount} overdue`;
    });

    // Library anomalies
    const overdueBookList = (overdueBooks || []).map(b => {
      const name = studentMap.get(b.student_id) || b.student_id;
      const bookTitle = (b.book as any)?.title || 'Unknown';
      return `${name}: "${bookTitle}" overdue since ${b.due_date}`;
    });

    // Build anomaly summary for AI analysis
    const anomalyData = `## Detected Anomalies (last 30 days)

### Attendance Drops (>20% decline in last 7 days vs prior weeks)
${attendanceDrops.length > 0 ? attendanceDrops.slice(0, 10).join('\n') : 'None detected'}

### Low Grade Alerts (<40% on recent assignments)
${lowGrades.length > 0 ? lowGrades.slice(0, 10).join('\n') : 'None detected'}

### Overdue Fee Payments
${overdueFees.length > 0 ? overdueFees.slice(0, 10).join('\n') : 'None detected'}

### Overdue Library Books
${overdueBookList.length > 0 ? overdueBookList.slice(0, 10).join('\n') : 'None detected'}

### Summary Stats
- Students with attendance drops: ${attendanceDrops.length}
- Students with low grades: ${lowGrades.length}
- Overdue fee payments: ${overdueFees.length}
- Overdue library books: ${overdueBookList.length}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a proactive school monitoring AI. Analyze anomaly data and produce prioritized alerts with actionable recommendations. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: `Analyze these school anomalies and produce prioritized alerts:\n\n${anomalyData}\n\nRespond with ONLY valid JSON:\n{\n  "criticalAlerts": [{"title": "short title", "description": "detailed description with names and data", "category": "attendance|grades|fees|library", "urgency": "critical|warning|info", "recommendation": "specific action to take"}],\n  "summary": "2-3 sentence executive summary of the school's current anomaly status",\n  "trendAnalysis": "brief analysis of whether these anomalies suggest a systemic issue or isolated incidents",\n  "immediateActions": ["action1", "action2", "action3"]\n}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch {
      analysis = { criticalAlerts: [], summary: cleaned, trendAnalysis: '', immediateActions: [] };
    }

    return NextResponse.json({
      success: true,
      rawAnomalies: {
        attendanceDrops: attendanceDrops.length,
        lowGrades: lowGrades.length,
        overdueFees: overdueFees.length,
        overdueBooks: overdueBookList.length,
        total: attendanceDrops.length + lowGrades.length + overdueFees.length + overdueBookList.length,
      },
      analysis,
    });
  } catch (error: unknown) {
    console.error('AI Anomaly Detection error:', error);
    const message = error instanceof Error ? error.message : 'Failed to detect anomalies';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
