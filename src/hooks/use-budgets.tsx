"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Budget } from "@/lib/types";

interface BudgetsState {
  budgets: Budget[];
  addBudget: (budget: Budget) => void;
  updateBudget: (budget: Budget) => void;
  removeBudget: (id: string) => void;
}

export const useBudgets = create<BudgetsState>()(
  persist(
    (set) => ({
      budgets: [],

      addBudget: (budget) =>
        set((state) => ({
          budgets: [...state.budgets, budget],
        })),

      updateBudget: (updatedBudget) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === updatedBudget.id ? updatedBudget : b
          ),
        })),

      // FIX: Ensure ID matching is precise and state updates cleanly
      removeBudget: (id) =>
        set((state) => {
          const newBudgets = state.budgets.filter((b) => b.id !== id);
          return { budgets: newBudgets };
        }),
    }),
    {
      name: "budgets-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => { },
          removeItem: () => { },
        };
      }),
    }
  )
);