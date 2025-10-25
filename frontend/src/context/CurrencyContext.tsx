import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

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
    const fetchExchangeRate = async () => {
      try {
        // You can integrate with an exchange rate API here
        // For example: https://api.exchangerate-api.com/v4/latest/USD
        // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        // const data = await response.json();
        // setExchangeRate(data.rates[currency]);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    };

    // Uncomment to fetch live rates
    // fetchExchangeRate();
  }, [currency]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const convertPrice = (priceUSD: number): number => {
    return priceUSD * exchangeRate;
  };

  const formatPrice = (priceUSD: number): string => {
    const convertedPrice = convertPrice(priceUSD);
    const symbol = CURRENCY_SYMBOLS[currency];

    return `${symbol}${convertedPrice.toFixed(2)}`;
  };

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
