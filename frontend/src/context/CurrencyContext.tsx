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

// Default fallback exchange rates
const DEFAULT_EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  PEN: 3.75 // Fallback rate
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  PEN: 'S/'
};

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency') as Currency | null;
    return saved || 'PEN'; // 🇵🇪 Por defecto en Soles (Moneda peruana)
  });

  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATES[currency]);

  // Fetch live exchange rates from API
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (currency === 'USD') {
        setExchangeRate(1);
        return;
      }

      try {
        // Using exchangerate-api.com (free tier: 1500 requests/month)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();

        if (data.rates && data.rates.PEN) {
          const rate = data.rates.PEN;
          setExchangeRate(rate);
          console.log(`💱 Tipo de cambio actualizado: 1 USD = ${rate.toFixed(2)} PEN`);
        } else {
          setExchangeRate(DEFAULT_EXCHANGE_RATES.PEN);
        }
      } catch (error) {
        console.error('Error al obtener tipo de cambio, usando tasa de respaldo:', error);
        setExchangeRate(DEFAULT_EXCHANGE_RATES.PEN);
      }
    };

    fetchExchangeRate();

    // Update exchange rate every 30 minutes
    const interval = setInterval(fetchExchangeRate, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  }, []);

  // Los precios en la BD están en USD (moneda base)
  const convertPrice = useCallback((priceUSD: number): number => {
    if (currency === 'PEN') {
      // Convertir de USD a PEN con tipo de cambio en tiempo real
      return priceUSD * exchangeRate;
    }
    // Ya está en USD
    return priceUSD;
  }, [currency, exchangeRate]);

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
