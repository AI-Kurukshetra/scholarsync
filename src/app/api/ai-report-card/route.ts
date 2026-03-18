import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ReportCardRequestSchema = z.object({
  studentId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = ReportCardRequestSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { studentId } = parsed.data;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Fetch all student data in parallel
    const [
      { data: student },
      { data: attendance },
      { data: grades },
      { data: examResults },
      { data: bookIssues },
    ] = await Promise.all([
      supabase
        .from('students')
        .select('id, first_name, last_name, email, date_of_birth, gender, enrollment_date, class:classes(name, grade_level, section)')
        .eq('id', studentId)
        .single(),
      supabase
        .from('attendance')
        .select('date, status')
        .eq('student_id', studentId),
      supabase
        .from('grades')
        .select('score, assignment:assignments(title, max_score, class_subject:class_subjects(subject:subjects(name)))')
        .eq('student_id', studentId),
      supabase
        .from('exam_results')
        .select('marks_obtained, exam:examinations(name, max_marks, subject:subjects(name))')
        .eq('student_id', studentId),
      supabase
        .from('book_issues')
        .select('status, fine_amount')
        .eq('student_id', studentId),
    ]);

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    // Calculate attendance stats
    const totalDays = attendance?.length || 0;
    const presentDays = attendance?.filter(a => a.status === 'present').length || 0;
    const lateDays = attendance?.filter(a => a.status === 'late').length || 0;
    const absentDays = attendance?.filter(a => a.status === 'absent').length || 0;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Calculate subject-wise grades
    const subjectGrades: Record<string, { total: number; maxTotal: number; count: number }> = {};
    for (const g of grades || []) {
      const subjectName = (g.assignment as any)?.class_subject?.subject?.name || 'Unknown';
      const maxScore = (g.assignment as any)?.max_score || 100;
      if (!subjectGrades[subjectName]) subjectGrades[subjectName] = { total: 0, maxTotal: 0, count: 0 };
      subjectGrades[subjectName].total += Number(g.score);
      subjectGrades[subjectName].maxTotal += maxScore;
      subjectGrades[subjectName].count += 1;
    }

    const subjectSummary = Object.entries(subjectGrades)
      .map(([subject, data]) => `${subject}: ${Math.round((data.total / data.maxTotal) * 100)}% (${data.count} assignments)`)
      .join('\n');

    // Exam performance
    const examSummary = (examResults || [])
      .map(e => `${(e.exam as any)?.name} — ${(e.exam as any)?.subject?.name}: ${e.marks_obtained}/${(e.exam as any)?.max_marks}`)
      .join('\n');

    // Library activity
    const booksIssued = bookIssues?.length || 0;
    const booksOverdue = bookIssues?.filter(b => b.status === 'overdue').length || 0;
    const totalFines = bookIssues?.reduce((sum, b) => sum + Number(b.fine_amount || 0), 0) || 0;

    const className = (student.class as any)?.name || 'Unknown';

    const prompt = `Generate a comprehensive, personalized narrative report card for this student. Be specific, insightful, and constructive.

## Student Information
- Name: ${student.first_name} ${student.last_name}
- Class: ${className}
- Gender: ${student.gender}
- Enrolled: ${student.enrollment_date}

## Attendance (${totalDays} school days recorded)
- Present: ${presentDays} days (${attendanceRate}%)
- Late: ${lateDays} days
- Absent: ${absentDays} days

## Subject Performance (Assignment Grades)
${subjectSummary || 'No grade data available'}

## Exam Results
${examSummary || 'No exam results available'}

## Library Activity
- Books issued: ${booksIssued}
- Currently overdue: ${booksOverdue}
- Fines: $${totalFines}

Respond with ONLY valid JSON:
{
  "overallGrade": "A/B/C/D/F letter grade based on overall performance",
  "gpa": "estimated GPA on 4.0 scale",
  "narrative": "A 3-4 paragraph personalized narrative covering academic performance, attendance, strengths, areas for improvement, and specific recommendations. Reference actual data points. Be encouraging but honest.",
  "subjectRemarks": [
    {"subject": "name", "grade": "letter", "remark": "1-2 sentence specific feedback"}
  ],
  "strengths": ["strength1", "strength2", "strength3"],
  "areasForImprovement": ["area1", "area2"],
  "teacherRecommendation": "A specific, actionable recommendation for the next term",
  "parentNote": "A brief note addressed to parents with guidance on how they can support their child"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an experienced school teacher writing thoughtful, personalized student report cards. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let reportCard;
    try {
      reportCard = JSON.parse(cleaned);
    } catch {
      reportCard = { narrative: cleaned, overallGrade: 'N/A', strengths: [], areasForImprovement: [] };
    }

    return NextResponse.json({
      success: true,
      student: {
        name: `${student.first_name} ${student.last_name}`,
        class: className,
        gender: student.gender,
        enrollmentDate: student.enrollment_date,
      },
      stats: {
        attendanceRate,
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        subjectsCount: Object.keys(subjectGrades).length,
        examsCount: examResults?.length || 0,
      },
      reportCard,
    });
  } catch (error: unknown) {
    console.error('AI Report Card error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate report card';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
