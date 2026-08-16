import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-helper';
import { FALLBACK_PRODUCTS } from '@/lib/data';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    // Return fallback products if DB not seeded yet
    return NextResponse.json(FALLBACK_PRODUCTS);
  }

  if (!data || data.length === 0) {
    return NextResponse.json(FALLBACK_PRODUCTS);
  }

  // Normalize DB column names to camelCase
  const products = data.map((p) => ({
    id: String(p.id),
    name: p.name,
    price: p.price,
    stock: p.stock,
    image: p.image,
    category: p.category,
    stoneColor: p.stone_color,
    plating: p.plating,
    description: p.description,
    inclusions: p.inclusions ?? [],
  }));

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const { user, error: authError } = await requireAdmin(request);
  if (authError || !user) {
    return NextResponse.json({ error: authError ?? 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, price, stock, image, category, stoneColor, plating, description, inclusions } =
    body;

  if (!name || !price) {
    return NextResponse.json({ error: 'name and price are required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      name,
      price: Number(price),
      stock: Number(stock ?? 10),
      image: image ?? null,
      category: category ?? null,
      stone_color: stoneColor ?? null,
      plating: plating ?? null,
      description: description ?? null,
      inclusions: inclusions ?? [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: String(data.id), ...data }, { status: 201 });
}
