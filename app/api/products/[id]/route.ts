import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-helper';
import { FALLBACK_PRODUCTS } from '@/lib/data';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Check fallback products first (string IDs like 'p1')
  const fallback = FALLBACK_PRODUCTS.find((p) => p.id === id);
  if (fallback) return NextResponse.json(fallback);

  // Try numeric DB ID
  const numId = Number(id);
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', numId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: String(data.id),
    name: data.name,
    price: data.price,
    stock: data.stock,
    image: data.image,
    category: data.category,
    stoneColor: data.stone_color,
    plating: data.plating,
    description: data.description,
    inclusions: data.inclusions ?? [],
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user, error: authError } = await requireAdmin(request);
  if (authError || !user) {
    return NextResponse.json({ error: authError ?? 'Unauthorized' }, { status: 401 });
  }

  const numId = Number(params.id);
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  const body = await request.json();
  const updatePayload: Record<string, unknown> = {};

  if (body.name !== undefined) updatePayload.name = body.name;
  if (body.price !== undefined) updatePayload.price = Number(body.price);
  if (body.stock !== undefined) updatePayload.stock = Number(body.stock);
  if (body.image !== undefined) updatePayload.image = body.image;
  if (body.category !== undefined) updatePayload.category = body.category;
  if (body.stoneColor !== undefined) updatePayload.stone_color = body.stoneColor;
  if (body.stone_color !== undefined) updatePayload.stone_color = body.stone_color;
  if (body.plating !== undefined) updatePayload.plating = body.plating;
  if (body.description !== undefined) updatePayload.description = body.description;
  if (body.inclusions !== undefined) updatePayload.inclusions = body.inclusions;
  if (body.is_featured !== undefined) updatePayload.is_featured = body.is_featured;
  if (body.meta_title !== undefined) updatePayload.meta_title = body.meta_title;
  if (body.meta_description !== undefined) updatePayload.meta_description = body.meta_description;
  if (body.slug !== undefined) updatePayload.slug = body.slug;
  updatePayload.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updatePayload)
    .eq('id', numId)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 500 });
  }

  return NextResponse.json({
    id: String(data.id),
    name: data.name,
    price: data.price,
    stock: data.stock,
    image: data.image,
    category: data.category,
    stoneColor: data.stone_color,
    plating: data.plating,
    description: data.description,
    inclusions: data.inclusions ?? [],
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user, error: authError } = await requireAdmin(request);
  if (authError || !user) {
    return NextResponse.json({ error: authError ?? 'Unauthorized' }, { status: 401 });
  }

  const numId = Number(params.id);
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('products').delete().eq('id', numId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
