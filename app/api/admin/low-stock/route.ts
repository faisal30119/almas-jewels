import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-helper';

// GET /api/admin/low-stock — products with stock <= 5
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { data, error: dbErr } = await supabaseAdmin
    .from('products')
    .select('id, name, stock, category')
    .lte('stock', 5)
    .order('stock', { ascending: true })
    .limit(20);

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}
