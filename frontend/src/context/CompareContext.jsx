import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

const STORAGE_KEY = 'shopera_compare_list';
const MAX_COMPARE_ITEMS = 4;

export const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [compareToast, setCompareToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareItems));
    } catch (e) {
      console.error('Failed to persist compare items:', e);
    }
  }, [compareItems]);

  const showToast = (message, type = 'info') => {
    setCompareToast({ message, type });
    setTimeout(() => setCompareToast(null), 3500);
  };

  const addToCompare = (product) => {
    if (!product || !product.id) return { success: false };

    // Check if already in list
    if (compareItems.some(item => item.id === product.id)) {
      showToast(`"${product.title}" is already in your comparison list.`, 'warning');
      return { success: false, reason: 'duplicate' };
    }

    // Check maximum limit of 4
    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      showToast(`Comparison list full (max ${MAX_COMPARE_ITEMS} products). Remove an item to add another.`, 'warning');
      return { success: false, reason: 'limit_reached' };
    }

    // Add minimal necessary product information for comparison
    const compareProduct = {
      id: product.id,
      title: product.title,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      discount_price: product.discount_price,
      stock_quantity: product.stock_quantity,
      image_url: product.image_url,
      category_name: product.category_name,
      rating: product.rating,
      num_reviews: product.num_reviews,
      specifications: product.specifications || {},
      short_description: product.short_description
    };

    setCompareItems(prev => [...prev, compareProduct]);
    showToast(`Added "${product.title}" to comparison list.`, 'success');
    return { success: true };
  };

  const removeFromCompare = (productId) => {
    setCompareItems(prev => prev.filter(item => item.id !== productId));
    showToast('Product removed from comparison list.', 'info');
  };

  const clearCompare = () => {
    setCompareItems([]);
    showToast('Comparison list cleared.', 'info');
  };

  const isInCompare = (productId) => {
    return compareItems.some(item => item.id === productId);
  };

  const toggleCompare = (product) => {
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
      return false;
    } else {
      const res = addToCompare(product);
      return res.success;
    }
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        compareCount: compareItems.length,
        maxItems: MAX_COMPARE_ITEMS,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        toggleCompare,
        compareToast,
        setCompareToast
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

export default CompareContext;
