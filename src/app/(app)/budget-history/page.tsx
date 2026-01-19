"use client";

import { useBudgets } from "@/hooks/use-budgets";
import { useTransactions } from "@/hooks/use-transactions";
import BudgetCard from "@/components/budgets/budget-card";
import { startOfDay, endOfDay, isWithinInterval, parseISO, isAfter } from "date-fns";
import { ScrollText } from "lucide-react";

export default function BudgetHistoryPage() {
    const { budgets, removeBudget } = useBudgets();
    const { transactions } = useTransactions();

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

    // FIX: Only show budgets that ARE expired (Past Budgets)
    const expiredBudgets = budgets.filter(budget => {
        const today = startOfDay(new Date());
        const budgetEnd = endOfDay(new Date(budget.endDate));
        // If today is AFTER the budget end date, it is expired.
        return isAfter(today, budgetEnd);
    });

    return (
        <div className="space-y-6 pt-24 pb-24 px-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                    <ScrollText className="h-6 w-6 text-foreground" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Budget History</h2>
                    <p className="text-muted-foreground">
                        A record of your past spending limits and performance.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {expiredBudgets.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
                        <p className="text-muted-foreground">No expired budgets yet.</p>
                        <p className="text-xs text-muted-foreground mt-1">Once a budget's end date passes, it will appear here.</p>
                    </div>
                ) : (
                    expiredBudgets.map((budget) => {
                        const realSpent = calculateSpent(budget);
                        return (
                            <div key={budget.id} className="opacity-80 hover:opacity-100 transition-opacity">
                                <BudgetCard
                                    budget={{ ...budget, spent: realSpent }}
                                    onDelete={() => removeBudget(budget.id)}
                                />
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
