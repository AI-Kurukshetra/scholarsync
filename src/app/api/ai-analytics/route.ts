import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const StudentDataSchema = z.object({
  name: z.string().min(1),
  class: z.string().min(1),
  attendanceRate: z.number().min(0).max(100),
  avgGrade: z.number().min(0).max(100),
  riskScore: z.number().min(0).max(1),
  riskLevel: z.enum(['low', 'medium', 'high']),
});

const AnalyticsRequestSchema = z.object({
  students: z.array(StudentDataSchema),
  classPerformance: z.array(z.object({
    name: z.string(),
    attendance: z.number(),
    grades: z.number(),
    atRisk: z.number().int().min(0),
    students: z.number().int().min(0),
  })),
  summary: z.object({
    totalStudents: z.number().int().min(0),
    atRisk: z.number().int().min(0),
    watchList: z.number().int().min(0),
    onTrack: z.number().int().min(0),
    avgAttendance: z.number().min(0).max(100),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const result = AnalyticsRequestSchema.safeParse(raw);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const body = result.data;
    const { students, classPerformance, summary } = body;

    // Build concise data summary for GPT
    const highRiskStudents = students
      .filter(s => s.riskLevel === 'high')
      .slice(0, 10)
      .map(s => `${s.name} (${s.class}): Attendance ${s.attendanceRate}%, Grade ${s.avgGrade}%, Risk ${s.riskScore}`)
      .join('\n');

    const mediumRiskStudents = students
      .filter(s => s.riskLevel === 'medium')
      .slice(0, 5)
      .map(s => `${s.name} (${s.class}): Attendance ${s.attendanceRate}%, Grade ${s.avgGrade}%`)
      .join('\n');

    const classData = classPerformance
      .map(c => `${c.name}: Avg Attendance ${c.attendance}%, Avg Grade ${c.grades}%, At-Risk ${c.atRisk}/${c.students}`)
      .join('\n');

    const prompt = `You are an AI education analytics assistant for ScholarSync, a school management system. Analyze the following school data and provide actionable insights.

## School Summary
- Total Students: ${summary.totalStudents}
- At-Risk Students: ${summary.atRisk} (${summary.totalStudents > 0 ? Math.round((summary.atRisk / summary.totalStudents) * 100) : 0}%)
- Watch List: ${summary.watchList}
- On Track: ${summary.onTrack}
- Average Attendance: ${summary.avgAttendance}%

## Class Performance
${classData || 'No class data available'}

## High-Risk Students
${highRiskStudents || 'None identified'}

## Medium-Risk Students
${mediumRiskStudents || 'None identified'}

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "overallInsight": "A 2-3 sentence executive summary of the school's academic health",
  "keyFindings": ["finding1", "finding2", "finding3"],
  "recommendations": [
    {"priority": "high", "action": "specific actionable recommendation", "impact": "expected outcome"},
    {"priority": "medium", "action": "specific actionable recommendation", "impact": "expected outcome"},
    {"priority": "low", "action": "specific actionable recommendation", "impact": "expected outcome"}
  ],
  "studentInsights": [
    {"name": "student name", "insight": "personalized AI recommendation for this specific student"}
  ],
  "predictions": {
    "attendanceTrend": "improving/stable/declining with brief explanation",
    "academicOutlook": "positive/cautious/concerning with brief explanation",
    "interventionUrgency": "immediate/moderate/low"
  }
}

For studentInsights, provide personalized recommendations for each high-risk student. Be specific and actionable. Reference actual data points.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert education data analyst. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || '{}';

    // Parse the JSON response
    let insights;
    try {
      // Remove potential markdown code fences
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      insights = JSON.parse(cleaned);
    } catch {
      insights = {
        overallInsight: content,
        keyFindings: [],
        recommendations: [],
        studentInsights: [],
        predictions: { attendanceTrend: 'stable', academicOutlook: 'cautious', interventionUrgency: 'moderate' },
      };
    }

    return NextResponse.json({ success: true, insights });
  } catch (error: unknown) {
    console.error('AI Analytics error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate AI insights';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
