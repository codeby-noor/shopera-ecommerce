import React, { createContext, useContext, useState, useEffect } from 'react';

// Explicitly configured benchmark exchange rates (Oct 2026 reference)
// No live banking API is fabricated; rates are documented simulation benchmarks
export const CURRENCY_CONFIG = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    rate: 1.0,
    locale: 'en-US'
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    rate: 84.50,
    locale: 'en-IN'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    rate: 0.92,
    locale: 'de-DE'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    rate: 0.78,
    locale: 'en-GB'
  }
};

export const EXCHANGE_RATE_DISCLAIMER = {
  source: 'Configured Portfolio Benchmark (Oct 2026)',
  settlementCurrency: 'USD',
  disclaimer: 'Exchange rates are fixed simulation benchmarks for demonstration. Base catalog inventory and payment authorizations are settled in US Dollars (USD).'
};

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  // 1. Confirm USD is default for new visitor unless explicit preference was stored
  const [currency, setCurrencyState] = useState(() => {
    try {
      const saved = localStorage.getItem('shopera_currency');
      if (saved && CURRENCY_CONFIG[saved]) {
        return saved;
      }
    } catch (e) {
      // Fallback
    }
    return 'USD';
  });

  const setCurrency = (code) => {
    if (CURRENCY_CONFIG[code]) {
      setCurrencyState(code);
      try {
        localStorage.setItem('shopera_currency', code);
      } catch (e) {
        console.error('Failed to persist currency to localStorage:', e);
      }
    }
  };

  const currentCurrency = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;

  // Convert USD base numeric amount to active display currency
  const convertPrice = (amountInUSD) => {
    const num = Number(amountInUSD);
    if (isNaN(num)) return 0;
    return num * currentCurrency.rate;
  };

  // Format a base USD amount into the active display currency
  const formatPrice = (amountInUSD, options = {}) => {
    const num = Number(amountInUSD);
    if (isNaN(num)) return '$0.00';

    const converted = num * currentCurrency.rate;

    try {
      const formatted = new Intl.NumberFormat(currentCurrency.locale, {
        style: 'currency',
        currency: currentCurrency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(converted);

      if (options.showOriginal && currency !== 'USD') {
        const origFormatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(num);
        return `${formatted} (${origFormatted})`;
      }

      return formatted;
    } catch (err) {
      return `${currentCurrency.symbol}${converted.toFixed(2)}`;
    }
  };

  // Format historical order amounts in their authentic recorded settlement currency
  // Ensures historical transactions are not mutated when visitor changes display currency
  const formatOrderPrice = (amount, orderCurrency = 'USD') => {
    const num = Number(amount);
    if (isNaN(num)) return '$0.00';

    const targetConfig = CURRENCY_CONFIG[orderCurrency] || CURRENCY_CONFIG.USD;

    try {
      return new Intl.NumberFormat(targetConfig.locale, {
        style: 'currency',
        currency: targetConfig.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    } catch (err) {
      return `${targetConfig.symbol}${num.toFixed(2)}`;
    }
  };

  const value = {
    currency,
    setCurrency,
    currentCurrency,
    availableCurrencies: Object.values(CURRENCY_CONFIG),
    convertPrice,
    formatPrice,
    formatOrderPrice,
    rateMetadata: EXCHANGE_RATE_DISCLAIMER
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
