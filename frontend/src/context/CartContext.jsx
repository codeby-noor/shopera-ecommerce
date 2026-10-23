import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load cart from backend if authenticated, or from localStorage for guest
  const loadCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        // Check if there are guest items to sync first
        const guestCart = localStorage.getItem('apex_guest_cart');
        if (guestCart) {
          try {
            const parsed = JSON.parse(guestCart);
            if (Array.isArray(parsed) && parsed.length > 0) {
              await cartAPI.syncCart(parsed.map(i => ({ productId: i.product_id, quantity: i.quantity })));
              localStorage.removeItem('apex_guest_cart');
            }
          } catch (e) {
            localStorage.removeItem('apex_guest_cart');
          }
        }

        const res = await cartAPI.getCart();
        if (res.data.success) {
          setCartItems(res.data.items);
          setCartSubtotal(res.data.subtotal);
          setCartCount(res.data.count);
        }
      } catch (err) {
        console.error('Failed to load user cart:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Guest mode: load from localStorage
      const guestCart = localStorage.getItem('apex_guest_cart');
      if (guestCart) {
        try {
          const items = JSON.parse(guestCart);
          setCartItems(items);
          calculateGuestTotals(items);
        } catch (e) {
          setCartItems([]);
          setCartSubtotal(0);
          setCartCount(0);
        }
      } else {
        setCartItems([]);
        setCartSubtotal(0);
        setCartCount(0);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCart();
  }, [loadCart, user?.id]);

  const calculateGuestTotals = (items) => {
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const sub = items.reduce((sum, item) => {
      const price = item.discount_price && item.discount_price > 0 ? Number(item.discount_price) : Number(item.price);
      return sum + (price * item.quantity);
    }, 0);
    setCartCount(totalCount);
    setCartSubtotal(parseFloat(sub.toFixed(2)));
  };

  const addToCart = async (product, quantity = 1) => {
    const qty = parseInt(quantity, 10) || 1;

    if (isAuthenticated) {
      try {
        const res = await cartAPI.addToCart(product.id, qty);
        if (res.data.success) {
          setCartItems(res.data.items);
          setCartSubtotal(res.data.subtotal);
          setCartCount(res.data.count);
          return { success: true, message: `Added "${product.title}" to cart!` };
        }
        return { success: false, message: res.data.message };
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Could not add to cart.' };
      }
    } else {
      // Guest mode
      const current = [...cartItems];
      const index = current.findIndex(i => i.product_id === product.id);

      if (index > -1) {
        const newQty = current[index].quantity + qty;
        if (newQty > product.stock_quantity) {
          return { success: false, message: `Only ${product.stock_quantity} units available in stock.` };
        }
        current[index].quantity = newQty;
      } else {
        if (qty > product.stock_quantity) {
          return { success: false, message: `Only ${product.stock_quantity} units available in stock.` };
        }
        current.push({
          cart_item_id: Date.now(),
          product_id: product.id,
          title: product.title,
          slug: product.slug,
          price: product.price,
          discount_price: product.discount_price,
          image_url: product.image_url,
          stock_quantity: product.stock_quantity,
          category_name: product.category_name,
          quantity: qty
        });
      }

      setCartItems(current);
      calculateGuestTotals(current);
      localStorage.setItem('apex_guest_cart', JSON.stringify(current));
      return { success: true, message: `Added "${product.title}" to cart!` };
    }
  };

  const updateQuantity = async (cartItemId, quantity, productId) => {
    if (quantity <= 0) {
      return removeFromCart(cartItemId, productId);
    }

    if (isAuthenticated) {
      try {
        const res = await cartAPI.updateQuantity(cartItemId, quantity);
        if (res.data.success) {
          setCartItems(res.data.items);
          setCartSubtotal(res.data.subtotal);
          setCartCount(res.data.count);
          return { success: true };
        }
        return { success: false, message: res.data.message };
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Could not update quantity.' };
      }
    } else {
      const current = cartItems.map(item => {
        if (item.cart_item_id === cartItemId || item.product_id === productId) {
          return { ...item, quantity };
        }
        return item;
      });
      setCartItems(current);
      calculateGuestTotals(current);
      localStorage.setItem('apex_guest_cart', JSON.stringify(current));
      return { success: true };
    }
  };

  const removeFromCart = async (cartItemId, productId) => {
    if (isAuthenticated) {
      try {
        const res = await cartAPI.removeFromCart(cartItemId);
        if (res.data.success) {
          setCartItems(res.data.items);
          setCartSubtotal(res.data.subtotal);
          setCartCount(res.data.count);
          return { success: true };
        }
      } catch (err) {
        console.error('Failed to remove cart item:', err);
      }
    } else {
      const filtered = cartItems.filter(item => item.cart_item_id !== cartItemId && item.product_id !== productId);
      setCartItems(filtered);
      calculateGuestTotals(filtered);
      localStorage.setItem('apex_guest_cart', JSON.stringify(filtered));
      return { success: true };
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartAPI.clearCart();
      } catch (err) {
        console.error('Failed to clear cart:', err);
      }
    } else {
      localStorage.removeItem('apex_guest_cart');
    }
    setCartItems([]);
    setCartSubtotal(0);
    setCartCount(0);
  };

  const value = {
    cartItems,
    cartCount,
    cartSubtotal,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: loadCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
