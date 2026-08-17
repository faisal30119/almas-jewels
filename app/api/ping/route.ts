import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET /api/ping — keep Supabase warm, use with cron-job.org every 5 minutes
export async function GET() {
  await supabaseAdmin.from('products').select('id').limit(1);
  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
