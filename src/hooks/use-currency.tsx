
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';
type CurrencySymbols = { [key in Currency]: string };

const currencySymbols: CurrencySymbols = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

type CurrencyContextType = {
  currency: Currency;
  currencySymbol: string;
  setCurrency: (currency: Currency) => void;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('INR');

  const currencySymbol = useMemo(() => currencySymbols[currency], [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, currencySymbol, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
