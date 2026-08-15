import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
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
  let pgProducts: Product[] = [];
  let fbProducts: Product[] = [];

  // 1. Fetch from Firestore first (Client direct)
  try {
    const querySnapshot = await Promise.race([
      getDocs(collection(db, 'products')),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
    ]) as any;

    if (querySnapshot && querySnapshot.docs) {
      fbProducts = querySnapshot.docs.map((docItem: any) => ({
        id: docItem.id,
        ...docItem.data(),
        image: sanitizeProductImage(docItem.data()?.image)
      })) as Product[];
    }
  } catch {
    // Graceful fallback
  }

  // 2. Fetch from backend API (if available, non-blocking)
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

  // 3. Merge: Prioritize Firestore / API live items, backfill with default catalog
  const combined = [...fbProducts, ...pgProducts, ...hardcodedProducts];
  
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

  // 2. Try Firestore doc
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await Promise.race([
      getDoc(docRef),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
    ]) as any;

    if (docSnap && docSnap.exists && docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        image: sanitizeProductImage(data?.image)
      } as Product;
    }
  } catch {
    // Fallback to API/Catalog
  }

  // 3. Try backend API
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
