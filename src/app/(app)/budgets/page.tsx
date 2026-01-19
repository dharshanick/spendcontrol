"use client";

import { useState } from "react";
import { useBudgets } from "@/hooks/use-budgets";
import { useTransactions } from "@/hooks/use-transactions"; // Import Transactions
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import BudgetCard from "@/components/budgets/budget-card"; // Assuming you have this component
import CreateBudgetModal from "@/components/budgets/create-budget-modal"; // Assuming you have this component
import { startOfDay, endOfDay, isWithinInterval, parseISO, isAfter } from "date-fns";

export default function BudgetsPage() {
  const { budgets, removeBudget } = useBudgets();
  const { transactions } = useTransactions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const calculateSpent = (budget: any) => {
    const budgetStart = startOfDay(new Date(budget.startDate));
    const budgetEnd = endOfDay(new Date(budget.endDate));

    return transactions
      .filter((t) =>
        t.type === 'expense' &&
        isWithinInterval(parseISO(t.date), { start: budgetStart, end: budgetEnd })
      )
      .reduce((acc, t) => acc + t.amount, 0);
  };

  // FIX: Only show budgets that are NOT expired (Active Budgets)
  const activeBudgets = budgets.filter(budget => {
    const today = startOfDay(new Date());
    const budgetEnd = endOfDay(new Date(budget.endDate));
    // If budgetEnd is today or in the future, it is active.
    return !isAfter(today, budgetEnd);
  });

  return (
    <div className="space-y-6 pt-24 pb-24 px-4 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Active Budgets</h2>
          <p className="text-muted-foreground">
            Current spending goals. Expired budgets move to History.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
        >
          <Plus className="h-4 w-4" /> Add New Budget
        </Button>
      </div>

      <div className="grid gap-6">
        {activeBudgets.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
            <p className="text-muted-foreground">No active budgets.</p>
            <p className="text-xs text-muted-foreground mt-1">Old budgets are in the History tab.</p>
            <Button variant="link" onClick={() => setIsCreateModalOpen(true)} className="text-green-500 mt-2">
              Create your first budget
            </Button>
          </div>
        ) : (
          activeBudgets.map((budget) => {
            const realSpent = calculateSpent(budget);
            return (
              <BudgetCard
                key={budget.id}
                budget={{ ...budget, spent: realSpent }}
                onDelete={() => removeBudget(budget.id)}
              />
            );
          })
        )}
      </div>

      <CreateBudgetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
