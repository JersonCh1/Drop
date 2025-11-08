import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';

type Currency = 'USD' | 'PEN';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number;
  convertPrice: (priceUSD: number) => number;
  formatPrice: (priceUSD: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates (you should fetch this from an API in production)
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  PEN: 3.75 // USD to PEN exchange rate
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  PEN: 'S/'
};

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency') as Currency | null;
    return saved || 'USD';
  });

  const [exchangeRate, setExchangeRate] = useState(EXCHANGE_RATES[currency]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
    setExchangeRate(EXCHANGE_RATES[currency]);
  }, [currency]);

  // Fetch live exchange rates (optional enhancement)
  useEffect(() => {
    // Future enhancement: fetch live exchange rates
    // const fetchExchangeRate = async () => {
    //   try {
    //     const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    //     const data = await response.json();
    //     setExchangeRate(data.rates[currency]);
    //   } catch (error) {
    //     console.error('Error fetching exchange rate:', error);
    //   }
    // };
    // fetchExchangeRate();
  }, [currency]);

  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  }, []);

  // Los precios en la BD están en USD (moneda base)
  const convertPrice = useCallback((priceUSD: number): number => {
    if (currency === 'PEN') {
      // Convertir de USD a PEN
      return priceUSD * EXCHANGE_RATES.PEN;
    }
    // Ya está en USD
    return priceUSD;
  }, [currency]);

  const formatPrice = useCallback((priceUSD: number): string => {
    const convertedPrice = convertPrice(priceUSD);
    const symbol = CURRENCY_SYMBOLS[currency];
    return `${symbol}${convertedPrice.toFixed(2)}`;
  }, [currency, convertPrice]);

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      exchangeRate,
      convertPrice,
      formatPrice,
      symbol: CURRENCY_SYMBOLS[currency]
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
