"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Budget } from '@/lib/types';

type BudgetsContextType = {
  budgets: Budget[];
  addBudget: (budget: Budget) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
};

const BudgetsContext = createContext<BudgetsContextType | undefined>(undefined);

export const BudgetsProvider = ({ children }: { children: ReactNode }) => {
  // 1. Start Empty (Vercel Safe)
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [mounted, setMounted] = useState(false);

  // 2. Load Data (Client Only)
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("spendcontrol_budgets");
    if (saved) {
      try {
        setBudgets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load budgets");
      }
    }
  }, []);

  // 3. Save Data
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("spendcontrol_budgets", JSON.stringify(budgets));
    }
  }, [budgets, mounted]);

  const addBudget = (budget: Budget) => {
    setBudgets((prev) => [...prev, budget]);
  };

  const updateBudget = (updatedBudget: Budget) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === updatedBudget.id ? updatedBudget : b))
    );
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <BudgetsContext.Provider value={{ budgets, addBudget, updateBudget, deleteBudget }}>
      {children}
    </BudgetsContext.Provider>
  );
};

export const useBudgets = () => {
  const context = useContext(BudgetsContext);
  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetsProvider');
  }
  return context;
};