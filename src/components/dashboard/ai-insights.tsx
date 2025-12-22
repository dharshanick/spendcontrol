"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, PiggyBank } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgets } from "@/hooks/use-budgets"; // Assuming you have this hook
import { useCurrency } from "@/hooks/use-currency";
import { useMemo } from "react";
import { startOfMonth, subMonths, isSameMonth, parseISO } from "date-fns";

export default function AIInsights() {
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { currencySymbol } = useCurrency();

  const insights = useMemo(() => {
    const tips: { icon: any; title: string; message: string; color: string }[] = [];
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));

    // DATA PREP
    const thisMonthTx = transactions.filter((t) => isSameMonth(parseISO(t.date), now));
    const lastMonthTx = transactions.filter((t) => isSameMonth(parseISO(t.date), subMonths(now, 1)));

    const thisMonthExpense = thisMonthTx.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    const lastMonthExpense = lastMonthTx.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    
    // 1. SPENDING SPIKE ALERT
    if (lastMonthExpense > 0) {
        const percentChange = ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100;
        if (percentChange > 20) {
            tips.push({
                icon: <TrendingUp className="h-5 w-5" />,
                title: "Spending Spike",
                message: `You've spent ${Math.round(percentChange)}% more this month than last month. Watch out!`,
                color: "text-red-500 bg-red-100 dark:bg-red-900/20"
            });
        } else if (percentChange < -10) {
             tips.push({
                icon: <TrendingDown className="h-5 w-5" />,
                title: "Great Control",
                message: `You've reduced spending by ${Math.abs(Math.round(percentChange))}% compared to last month!`,
                color: "text-green-500 bg-green-100 dark:bg-green-900/20"
            });
        }
    }

    // 2. HIGHEST CATEGORY CHECK
    if (thisMonthTx.length > 0) {
        const categories: Record<string, number> = {};
        thisMonthTx.filter(t => t.type === 'expense').forEach(t => {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
        });
        
        // Find category with max spend
        const maxCat = Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b, "");
        if (maxCat) {
             tips.push({
                icon: <AlertTriangle className="h-5 w-5" />,
                title: "Top Expense",
                message: `Most of your money went to '${maxCat}' this month (${currencySymbol}${categories[maxCat].toLocaleString()}).`,
                color: "text-orange-500 bg-orange-100 dark:bg-orange-900/20"
            });
        }
    }

    // 3. SAVINGS MILESTONE
    const totalIncome = thisMonthTx.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - thisMonthExpense) / totalIncome) * 100 : 0;
    
    if (savingsRate > 20) {
        tips.push({
            icon: <PiggyBank className="h-5 w-5" />,
            title: "Super Saver",
            message: `You're saving ${Math.round(savingsRate)}% of your income. That's excellent financial health!`,
            color: "text-blue-500 bg-blue-100 dark:bg-blue-900/20"
        });
    }

    // 4. BUDGET WARNINGS
    // Find any budget that is > 90% used
    const criticalBudget = budgets.find(b => {
         // Simple check: This assumes budget logic is available. 
         // If calculating budget progress is complex, skip this or duplicate the logic.
         // For now, let's keep it simple or skip if budgets aren't easily calculable here.
         return false; 
    });

    // FILLER (If no data yet)
    if (tips.length === 0) {
        tips.push({
            icon: <Sparkles className="h-5 w-5" />,
            title: "Getting Started",
            message: "Add more income and expenses to unlock smart insights about your spending habits.",
            color: "text-purple-500 bg-purple-100 dark:bg-purple-900/20"
        });
    }

    return tips.slice(0, 3); // Return top 3 insights
  }, [transactions, budgets, currencySymbol]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500 fill-yellow-500" /> 
            Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {insights.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 hover:bg-muted/50 transition-colors">
                <div className={`p-2 rounded-full shrink-0 ${tip.color}`}>
                    {tip.icon}
                </div>
                <div>
                    <div className="font-semibold text-sm">{tip.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {tip.message}
                    </div>
                </div>
            </div>
        ))}
      </CardContent>
    </Card>
  );
}