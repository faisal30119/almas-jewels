import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-helper';
import { FALLBACK_PRODUCTS } from '@/lib/data';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') ?? '';

  let query = supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(FALLBACK_PRODUCTS);
  }

  if (!data || data.length === 0) {
    return NextResponse.json(FALLBACK_PRODUCTS);
  }

  // Return both snake_case and camelCase aliases for compatibility
  const products = data.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    image: p.image,
    category: p.category,
    stone_color: p.stone_color,
    stoneColor: p.stone_color,
    plating: p.plating,
    description: p.description,
    inclusions: p.inclusions ?? [],
    is_featured: p.is_featured ?? false,
    meta_title: p.meta_title ?? '',
    meta_description: p.meta_description ?? '',
    slug: p.slug ?? '',
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
      stone_color: stoneColor ?? body.stone_color ?? null,
      plating: plating ?? null,
      description: description ?? null,
      inclusions: inclusions ?? [],
      is_featured: body.is_featured ?? false,
      meta_title: body.meta_title ?? null,
      meta_description: body.meta_description ?? null,
      slug: body.slug ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: String(data.id), ...data }, { status: 201 });
}
