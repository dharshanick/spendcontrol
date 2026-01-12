"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Budget } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

type BudgetsContextType = {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
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
        const parsed = JSON.parse(saved);
        // Retroactively fix missing IDs
        const validated = Array.isArray(parsed) ? parsed.map((b: any) => ({ ...b, id: b.id || uuidv4() })) : [];
        setBudgets(validated);
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

  const addBudget = (budget: Omit<Budget, 'id'> & { id?: string }) => {
    const newBudget = { ...budget, id: budget.id || uuidv4() };
    setBudgets((prev) => [...prev, newBudget]);
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