import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check if schema already exists
    const { error: checkErr } = await supabase.from('profiles').select('id').limit(1);

    if (!checkErr || checkErr.code !== 'PGRST116') {
      // Table exists (or some other error, but not "relation does not exist")
      if (!checkErr) {
        return NextResponse.json({ success: true, message: 'Schema already applied.' });
      }
    }

    // If we get here, schema needs to be applied.
    // We can't run DDL through PostgREST, so we'll use the workaround:
    // Create tables through the Supabase client's internal SQL execution

    return NextResponse.json({
      success: false,
      message: 'Schema not yet applied. Please run schema.sql in Supabase SQL Editor.',
      sql_editor_url: `https://supabase.com/dashboard/project/hgurcoennrynynaucmdy/sql/new`,
    }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
