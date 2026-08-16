import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-helper';

const ALLOWED_TABLES = ['products', 'user_orders', 'user_profiles', 'coupons'];

export async function GET(
  request: Request,
  { params }: { params: { table: string } }
) {
  const { user, error: authError } = await requireAdmin(request);
  if (authError || !user) {
    return NextResponse.json({ error: authError ?? 'Unauthorized' }, { status: 401 });
  }

  const { table } = params;
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Table not allowed' }, { status: 403 });
  }

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 100), 500);
  const offset = Number(url.searchParams.get('offset') ?? 0);

  const { data, error, count } = await supabaseAdmin
    .from(table)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count, limit, offset });
}
