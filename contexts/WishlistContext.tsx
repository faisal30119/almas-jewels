'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';

interface WishlistContextValue {
  wishlist: string[];
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (id: string) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    supabase
      .from('user_profiles')
      .select('wishlist')
      .eq('uid', user.id)
      .single()
      .then(({ data }) => {
        setWishlist(data?.wishlist ?? []);
        setLoading(false);
      });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleWishlist = useCallback(
    async (id: string) => {
      if (!user) return;
      const next = wishlist.includes(id)
        ? wishlist.filter((w) => w !== id)
        : [...wishlist, id];

      // Optimistic update
      setWishlist(next);

      const { error } = await supabase
        .from('user_profiles')
        .upsert(
          { uid: user.id, email: user.email ?? '', wishlist: next },
          { onConflict: 'uid' }
        );
      if (error) {
        // revert on failure
        setWishlist(wishlist);
      }
    },
    [user, wishlist, supabase]
  );

  const isWishlisted = useCallback(
    (id: string) => wishlist.includes(id),
    [wishlist]
  );

  return (
    <WishlistContext.Provider value={{ wishlist, isWishlisted, toggleWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}
