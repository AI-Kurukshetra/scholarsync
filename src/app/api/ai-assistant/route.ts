import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getSchoolContext() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const [
    { count: studentCount },
    { count: teacherCount },
    { data: classes },
    { count: attendanceCount },
    { data: recentAnnouncements },
    { data: upcomingEvents },
    { count: bookCount },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
    supabase.from('classes').select('name'),
    supabase.from('attendance').select('*', { count: 'exact', head: true }),
    supabase.from('announcements').select('title, content, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('events').select('title, event_date, location').gte('event_date', new Date().toISOString().split('T')[0]).order('event_date').limit(5),
    supabase.from('library_books').select('*', { count: 'exact', head: true }),
  ]);

  return {
    totalStudents: studentCount || 0,
    totalTeachers: teacherCount || 0,
    classes: (classes || []).map(c => c.name).join(', '),
    totalAttendanceRecords: attendanceCount || 0,
    recentAnnouncements: (recentAnnouncements || []).map(a => `${a.title}: ${(a.content || '').slice(0, 100)}`).join('\n'),
    upcomingEvents: (upcomingEvents || []).map(e => `${e.title} on ${e.event_date}${e.location ? ` at ${e.location}` : ''}`).join('\n'),
    libraryBooks: bookCount || 0,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    const context = await getSchoolContext();

    const systemPrompt = `You are ScholarSync AI Assistant, a helpful virtual assistant for ScholarSync school management platform. You help administrators, teachers, and parents with questions about the school.

## Current School Data:
- Total Active Students: ${context.totalStudents}
- Total Teachers: ${context.totalTeachers}
- Classes: ${context.classes}
- Attendance Records: ${context.totalAttendanceRecords}
- Library Books: ${context.libraryBooks}

## Recent Announcements:
${context.recentAnnouncements || 'None'}

## Upcoming Events:
${context.upcomingEvents || 'None scheduled'}

## Your Capabilities:
- Answer questions about school operations, student data, policies
- Help navigate ScholarSync features (students, attendance, grades, fees, etc.)
- Explain how to use different modules
- Provide general education management advice
- Share information about upcoming events and announcements

## Guidelines:
- Be concise and helpful
- Use data from the school context when relevant
- If you don't know something specific, suggest where in ScholarSync to find it
- Be professional but friendly
- When asked about specific student data, remind users to check the relevant module for detailed info`;

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-6),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || 'I apologize, I could not process that request.';

    return NextResponse.json({ success: true, reply });
  } catch (error: unknown) {
    console.error('AI Assistant error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process request';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
