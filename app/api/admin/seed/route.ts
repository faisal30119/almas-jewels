import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-helper';
import { FALLBACK_PRODUCTS } from '@/lib/data';

export async function POST(request: Request) {
  const { user, error: authError } = await requireAdmin(request);
  if (authError || !user) {
    return NextResponse.json({ error: authError ?? 'Unauthorized' }, { status: 401 });
  }

  // Check existing products
  const { data: existing } = await supabaseAdmin
    .from('products')
    .select('name');

  const existingNames = new Set((existing ?? []).map((p: { name: string }) => p.name));

  // Only insert products that don't already exist by name
  const toInsert = FALLBACK_PRODUCTS
    .filter(p => !existingNames.has(p.name))
    .map(p => ({
      name: p.name,
      price: p.price,
      stock: p.stock ?? 10,
      image: p.image,
      category: p.category,
      stone_color: p.stoneColor,
      plating: p.plating,
      description: p.description,
      inclusions: p.inclusions,
    }));

  if (toInsert.length === 0) {
    return NextResponse.json({ message: 'All products already exist', inserted: 0 });
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert(toInsert)
    .select('id, name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: `Seeded ${data.length} product(s) successfully`,
    inserted: data.length,
    products: data,
  });
}
