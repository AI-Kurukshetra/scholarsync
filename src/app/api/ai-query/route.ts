import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const QueryRequestSchema = z.object({
  question: z.string().min(3).max(500),
});

const SCHEMA_CONTEXT = `You are a SQL query generator for a school management system using PostgreSQL (Supabase).

## Database Schema:
- profiles(id UUID, email TEXT, full_name TEXT, role TEXT['admin','teacher','parent'], created_at TIMESTAMPTZ)
- students(id UUID, first_name TEXT, last_name TEXT, email TEXT, date_of_birth DATE, gender TEXT, class_id UUID→classes, enrollment_date DATE, status TEXT['active','inactive','transferred'], created_at TIMESTAMPTZ)
- classes(id UUID, name TEXT, grade_level INTEGER, section TEXT, teacher_id UUID→profiles)
- subjects(id UUID, name TEXT, code TEXT)
- attendance(id UUID, student_id UUID→students, class_id UUID→classes, date DATE, status TEXT['present','absent','late','excused'], marked_by UUID→profiles)
- assignments(id UUID, title TEXT, class_subject_id UUID→class_subjects, due_date DATE, max_score INTEGER)
- grades(id UUID, student_id UUID→students, assignment_id UUID→assignments, score NUMERIC, remarks TEXT)
- fee_payments(id UUID, student_id UUID→students, fee_structure_id UUID→fee_structures, amount_paid NUMERIC, payment_date DATE, status TEXT['paid','pending','overdue','partial'])
- fee_structures(id UUID, name TEXT, amount NUMERIC, due_date DATE)
- examinations(id UUID, name TEXT, class_id UUID→classes, subject_id UUID→subjects, date DATE, max_marks INTEGER)
- exam_results(id UUID, exam_id UUID→examinations, student_id UUID→students, marks_obtained NUMERIC)
- library_books(id UUID, title TEXT, author TEXT, isbn TEXT, category TEXT, total_copies INTEGER, available_copies INTEGER)
- book_issues(id UUID, book_id UUID→library_books, student_id UUID→students, issue_date DATE, due_date DATE, return_date DATE, status TEXT['issued','returned','overdue'], fine_amount NUMERIC)
- announcements(id UUID, title TEXT, content TEXT, author_id UUID→profiles, target_role TEXT, is_pinned BOOLEAN, created_at TIMESTAMPTZ)
- events(id UUID, title TEXT, event_date DATE, location TEXT)
- hostel_rooms(id UUID, room_number TEXT, block TEXT, capacity INTEGER, occupied INTEGER, room_type TEXT, status TEXT)
- hostel_allocations(id UUID, room_id UUID→hostel_rooms, student_id UUID→students, mess_opted BOOLEAN, status TEXT['active','vacated'])
- transport_routes(id UUID, name TEXT, driver_name TEXT, vehicle_number TEXT, capacity INTEGER)
- inventory_items(id UUID, name TEXT, category TEXT, quantity INTEGER, condition TEXT, unit_cost NUMERIC)
- payroll(id UUID, teacher_id UUID→profiles, month INTEGER, year INTEGER, basic_salary NUMERIC, net_salary NUMERIC, status TEXT['pending','processed','paid'])

## Rules:
1. Generate ONLY SELECT queries — never INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, or any DDL/DML
2. Use proper JOINs for related data
3. Always add LIMIT 50 at the end
4. Use descriptive column aliases for readability
5. Respond with ONLY a JSON object: {"sql": "SELECT ...", "explanation": "what this query returns"}
6. If the question cannot be answered: {"sql": null, "explanation": "reason"}`;

function isSafeQuery(sql: string): boolean {
  const normalized = sql.replace(/\s+/g, ' ').trim().toLowerCase();
  if (!normalized.startsWith('select')) return false;
  const forbidden = ['insert ', 'update ', 'delete ', 'drop ', 'alter ', 'truncate ', 'create ', 'grant ', 'revoke ', 'execute ', 'exec '];
  for (const kw of forbidden) {
    if (normalized.includes(kw)) return false;
  }
  if (normalized.includes('--') || normalized.includes(';')) return false;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = QueryRequestSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Please enter a question (3-500 characters).', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { question } = parsed.data;

    // Step 1: AI generates SQL from natural language
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SCHEMA_CONTEXT },
        { role: 'user', content: question },
      ],
      temperature: 0.2,
      max_tokens: 600,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let aiResult: { sql: string | null; explanation: string };
    try {
      aiResult = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ success: false, error: 'Failed to parse AI response' }, { status: 500 });
    }

    if (!aiResult.sql) {
      return NextResponse.json({ success: true, data: [], explanation: aiResult.explanation, query: null, rowCount: 0 });
    }

    // Step 2: Safety validation
    if (!isSafeQuery(aiResult.sql)) {
      return NextResponse.json(
        { success: false, error: 'Only read-only SELECT queries are permitted' },
        { status: 403 }
      );
    }

    // Step 3: Execute via Supabase RPC (read-only database function)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await supabase.rpc('execute_readonly_query', {
      query_text: aiResult.sql,
    });

    if (error) {
      return NextResponse.json({
        success: true,
        data: [],
        explanation: aiResult.explanation,
        query: aiResult.sql,
        rowCount: 0,
        queryError: 'Query could not be executed. The AI-generated SQL may reference columns or relationships not available.',
      });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      explanation: aiResult.explanation,
      query: aiResult.sql,
      rowCount: Array.isArray(data) ? data.length : 0,
    });
  } catch (error: unknown) {
    console.error('AI Query error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process query';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
