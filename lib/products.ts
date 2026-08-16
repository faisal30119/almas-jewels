import { createClient } from './supabase/server';
import { FALLBACK_PRODUCTS, Product } from './data';

export async function getAllProducts(): Promise<Product[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map((p: any) => ({
        id: String(p.id),
        name: p.name,
        price: p.price,
        stock: p.stock,
        image: p.image || FALLBACK_PRODUCTS[0].image,
        category: p.category || '',
        stoneColor: p.stone_color || '',
        plating: p.plating || '',
        description: p.description || '',
        inclusions: p.inclusions || [],
      }));
    }
  } catch {}
  return FALLBACK_PRODUCTS;
}

export async function getProductById(id: string): Promise<Product | null> {
  const fallback = FALLBACK_PRODUCTS.find((p) => p.id === id);
  if (fallback) return fallback;
  try {
    const supabase = createClient();
    const numId = Number(id);
    if (!isNaN(numId)) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', numId)
        .single();
      if (!error && data) {
        return {
          id: String(data.id),
          name: data.name,
          price: data.price,
          stock: data.stock,
          image: data.image || FALLBACK_PRODUCTS[0].image,
          category: data.category || '',
          stoneColor: data.stone_color || '',
          plating: data.plating || '',
          description: data.description || '',
          inclusions: data.inclusions || [],
        };
      }
    }
  } catch {}
  return null;
}
