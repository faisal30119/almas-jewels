import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-helper';

// GET /api/admin/settings
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { data, error: dbErr } = await supabaseAdmin.from('site_settings').select('*');
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  // Convert array of {key, value} to object
  const settings: Record<string, string> = {};
  (data ?? []).forEach((row) => { settings[row.key] = row.value; });
  return NextResponse.json({ data: settings });
}

// POST /api/admin/settings — upsert bulk key-value pairs
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const body: Record<string, string> = await req.json();
  const rows = Object.entries(body).map(([key, value]) => ({ key, value }));

  const { error: dbErr } = await supabaseAdmin
    .from('site_settings')
    .upsert(rows, { onConflict: 'key' });

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
