import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-helper';

export async function GET(request: Request) {
  const { user, error: authError } = await requireAdmin(request);
  if (authError || !user) {
    return NextResponse.json({ error: authError ?? 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const threshold = Number(url.searchParams.get('threshold') ?? 5);

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, name, stock, category')
    .lt('stock', threshold)
    .order('stock', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data ?? [], threshold });
}
