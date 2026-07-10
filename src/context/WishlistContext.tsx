import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Product } from '../data';
import { getDocs } from 'firebase/firestore';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[];
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: [],
  wishlistProducts: [],
  toggleWishlist: async () => {},
  isInWishlist: () => false,
  loading: true,
});

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlistIds([]);
        setWishlistProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        let ids: string[] = [];
        if (userSnap.exists()) {
          ids = userSnap.data().wishlist || [];
        }
        
        setWishlistIds(ids);

        // Fetch product details for these IDs (we can do it here or in Profile)
        // Since we only need IDs for the heart icons, we might only fetch full products when needed, 
        // but for simplicity let's fetch them here.
        if (ids.length > 0) {
          // We need to fetch from products collection, or find in hardcoded products.
          // To avoid complexity, we can just export a fetchProduct function or similar.
          // Actually, let's keep it simple: we just store IDs in context, and Profile page will fetch the products.
          // But wait, the context has wishlistProducts. We can fetch them.
          // To avoid circular dependency with Shop fetching logic, let's just use getDocs for products collection
          // or we just remove wishlistProducts from Context and fetch them in Profile.
          // Let's remove wishlistProducts from Context.
        }
      } catch (error) {
        console.error("Error fetching wishlist: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (product: Product) => {
    if (!user) {
      // In a real app, maybe trigger sign in
      return;
    }

    const productId = product.id;
    const isCurrentlyIn = wishlistIds.includes(productId);
    
    // Optimistic update
    const newIds = isCurrentlyIn 
      ? wishlistIds.filter(id => id !== productId)
      : [...wishlistIds, productId];
      
    setWishlistIds(newIds);

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        wishlist: isCurrentlyIn ? arrayRemove(productId) : arrayUnion(productId)
      }, { merge: true });
    } catch (error) {
      console.error("Error updating wishlist: ", error);
      // Revert on error
      setWishlistIds(wishlistIds);
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, wishlistProducts: [], toggleWishlist, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};
