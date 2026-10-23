import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const loadWishlist = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await wishlistAPI.getWishlist();
        if (res.data.success) {
          setWishlistItems(res.data.items);
          setWishlistCount(res.data.count);
          setWishlistIds(new Set(res.data.items.map(item => item.id)));
        }
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Guest mode
      const stored = localStorage.getItem('apex_guest_wishlist');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setWishlistItems(parsed);
          setWishlistCount(parsed.length);
          setWishlistIds(new Set(parsed.map(i => i.id)));
        } catch (e) {
          setWishlistItems([]);
          setWishlistCount(0);
          setWishlistIds(new Set());
        }
      } else {
        setWishlistItems([]);
        setWishlistCount(0);
        setWishlistIds(new Set());
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist, user?.id]);

  const toggleWishlist = async (product) => {
    if (isAuthenticated) {
      try {
        const res = await wishlistAPI.toggleWishlist(product.id);
        if (res.data.success) {
          const inWishlist = res.data.inWishlist;
          const nextSet = new Set(wishlistIds);
          if (inWishlist) {
            nextSet.add(product.id);
            setWishlistItems(prev => [product, ...prev]);
          } else {
            nextSet.delete(product.id);
            setWishlistItems(prev => prev.filter(i => i.id !== product.id));
          }
          setWishlistIds(nextSet);
          setWishlistCount(res.data.count);
          return { success: true, inWishlist, message: res.data.message };
        }
        return { success: false, message: res.data.message };
      } catch (err) {
        return { success: false, message: 'Could not update wishlist.' };
      }
    } else {
      // Guest local toggle
      const nextSet = new Set(wishlistIds);
      let inWishlist = false;
      let nextItems = [];

      if (nextSet.has(product.id)) {
        nextSet.delete(product.id);
        nextItems = wishlistItems.filter(i => i.id !== product.id);
        inWishlist = false;
      } else {
        nextSet.add(product.id);
        nextItems = [product, ...wishlistItems];
        inWishlist = true;
      }

      setWishlistIds(nextSet);
      setWishlistItems(nextItems);
      setWishlistCount(nextItems.length);
      localStorage.setItem('apex_guest_wishlist', JSON.stringify(nextItems));
      return {
        success: true,
        inWishlist,
        message: inWishlist ? 'Added to wishlist!' : 'Removed from wishlist.'
      };
    }
  };

  const removeFromWishlist = async (productId) => {
    if (isAuthenticated) {
      try {
        const res = await wishlistAPI.removeFromWishlist(productId);
        if (res.data.success) {
          setWishlistItems(prev => prev.filter(i => i.id !== productId));
          setWishlistCount(res.data.count);
          const nextSet = new Set(wishlistIds);
          nextSet.delete(productId);
          setWishlistIds(nextSet);
          return { success: true };
        }
      } catch (err) {
        console.error('Failed to remove from wishlist:', err);
      }
    } else {
      const nextItems = wishlistItems.filter(i => i.id !== productId);
      setWishlistItems(nextItems);
      setWishlistCount(nextItems.length);
      const nextSet = new Set(wishlistIds);
      nextSet.delete(productId);
      setWishlistIds(nextSet);
      localStorage.setItem('apex_guest_wishlist', JSON.stringify(nextItems));
      return { success: true };
    }
  };

  const isInWishlist = (productId) => {
    return wishlistIds.has(productId);
  };

  const value = {
    wishlistItems,
    wishlistCount,
    loading,
    toggleWishlist,
    removeFromWishlist,
    isInWishlist
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
