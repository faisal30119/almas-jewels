import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Product } from '../data';

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
  const { user, openAuthModal } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlistIds([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('wishlist')
          .eq('uid', user.id)
          .single();

        if (!error && data?.wishlist) {
          setWishlistIds(data.wishlist as string[]);
        } else {
          setWishlistIds([]);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setWishlistIds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (product: Product) => {
    if (!user) {
      openAuthModal('login');
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
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          uid: user.id,
          email: user.email || '',
          wishlist: newIds
        }, { onConflict: 'uid' });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating wishlist:', error);
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
