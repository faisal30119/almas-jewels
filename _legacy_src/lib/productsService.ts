import { supabase } from './supabase';
import { products as hardcodedProducts, Product } from '../data';

const royalCollectionImg = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277886/almas_bridal/assets/dpjqxedlu5oleauyj40l.jpg';
const solitaireCollectionImg = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277888/almas_bridal/assets/uoge8dcesrge8bsgimj6.jpg';
const occasionCollectionImg = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277883/almas_bridal/assets/brxuufifingum5xyjodn.jpg';
const pendantMainImg = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277893/almas_bridal/assets/panbrhgotshii2pl5zkb.jpg';
const pendantSub1Img = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277895/almas_bridal/assets/blteocmlx1mlsl7qtzx0.jpg';
const pendantSub2Img = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277897/almas_bridal/assets/uffidivwpwv2wicg7m71.jpg';
const pendantSub3Img = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277900/almas_bridal/assets/e5g5yagqr1ksbakallnl.jpg';

export const imageMap: Record<string, string> = {
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277886/almas_bridal/assets/dpjqxedlu5oleauyj40l.jpg': royalCollectionImg,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277888/almas_bridal/assets/uoge8dcesrge8bsgimj6.jpg': solitaireCollectionImg,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277883/almas_bridal/assets/brxuufifingum5xyjodn.jpg': occasionCollectionImg,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277893/almas_bridal/assets/panbrhgotshii2pl5zkb.jpg': pendantMainImg,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277895/almas_bridal/assets/blteocmlx1mlsl7qtzx0.jpg': pendantSub1Img,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277897/almas_bridal/assets/uffidivwpwv2wicg7m71.jpg': pendantSub2Img,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277900/almas_bridal/assets/e5g5yagqr1ksbakallnl.jpg': pendantSub3Img,
};

export const sanitizeProductImage = (img?: string): string => {
  if (!img) return occasionCollectionImg;
  if (img.includes('unsplash.com')) return occasionCollectionImg;
  return imageMap[img] || img;
};

export async function fetchAllProducts(): Promise<Product[]> {
  let supabaseProducts: Product[] = [];
  let pgProducts: Product[] = [];

  // 1. Fetch from Supabase (supabase_products table)
  try {
    const { data, error } = await supabase
      .from('supabase_products')
      .select('*');

    if (!error && data && data.length > 0) {
      supabaseProducts = data.map((item: any) => ({
        id: String(item.id),
        name: item.name,
        price: item.price,
        stock: item.stock,
        image: sanitizeProductImage(item.image),
        category: item.category,
        stoneColor: item.stone_color || item.stoneColor,
        plating: item.plating,
        description: item.description,
        inclusions: item.inclusions || []
      })) as Product[];
    }
  } catch {
    // Graceful fallback
  }

  // 2. Fetch from backend API (Cloud SQL, if available)
  try {
    const res = await fetch('/api/products').catch(() => null);
    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (Array.isArray(data)) {
        pgProducts = data.map((item: any) => ({
          ...item,
          id: String(item.id),
          stoneColor: item.stone_color || item.stoneColor,
          image: sanitizeProductImage(item.image)
        }));
      }
    }
  } catch {
    // Graceful fallback
  }

  // 3. Merge: Supabase first, then Cloud SQL, then hardcoded catalog
  const combined = [...supabaseProducts, ...pgProducts, ...hardcodedProducts];

  // Deduplicate by name and ID
  const seen = new Set<string>();
  const uniqueList: Product[] = [];

  for (const item of combined) {
    if (!item) continue;
    const key = item.id || item.name;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueList.push(item);
    }
  }

  return uniqueList.length > 0 ? uniqueList : hardcodedProducts;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (!id) return null;

  // 1. Check hardcoded catalog first for instant match
  const hardcoded = hardcodedProducts.find(p => p.id === id);
  if (hardcoded) {
    return hardcoded;
  }

  // 2. Try Supabase
  try {
    const { data, error } = await supabase
      .from('supabase_products')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      return {
        id: String(data.id),
        name: data.name,
        price: data.price,
        stock: data.stock,
        image: sanitizeProductImage(data.image),
        category: data.category,
        stoneColor: data.stone_color || data.stoneColor,
        plating: data.plating,
        description: data.description,
        inclusions: data.inclusions || []
      } as Product;
    }
  } catch {
    // Fallback to API/Catalog
  }

  // 3. Try backend API (Cloud SQL)
  try {
    const res = await fetch(`/api/products/${id}`).catch(() => null);
    if (res && res.ok) {
      const item = await res.json().catch(() => null);
      if (item && item.name) {
        return {
          ...item,
          id: String(item.id),
          stoneColor: item.stone_color || item.stoneColor,
          image: sanitizeProductImage(item.image)
        } as Product;
      }
    }
  } catch {
    // Fallback
  }

  return hardcodedProducts[0] || null;
}
