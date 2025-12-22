"use client";

import SummaryCard from "@/components/dashboard/summary-card";
import { useTransactions } from "@/hooks/use-transactions";
import { CircleDollarSign, IndianRupee, Wallet } from "lucide-react";
import SpendingOverviewChart from "@/components/dashboard/spending-overview-chart";
import SpendingFlowChart from "@/components/dashboard/spending-flow-chart";
import AIInsights from "@/components/dashboard/ai-insights";
import { useMemo, useState, useEffect } from "react";
import { endOfMonth, isWithinInterval, parseISO, startOfMonth, subMonths, format, startOfDay, endOfDay, isEqual, startOfYear, getYear, differenceInDays, startOfWeek, endOfWeek } from "date-fns";
import { useBudgets } from "@/hooks/use-budgets";
import DashboardBudgetCard from "@/components/dashboard/dashboard-budget-card"; 
import EditBalanceModal from "@/components/dashboard/edit-balance-modal";
import { v4 as uuidv4 } from 'uuid';
import ReminderModal from "@/components/reminders/reminder-modal";
import type { Budget } from "@/lib/types";

// ✅ 1. Import the QuickActions component
import QuickActions from "@/components/dashboard/quick-actions";

const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
};

export default function DashboardPage() {
    const { transactions, addTransaction } = useTransactions();
    const { budgets, updateBudget } = useBudgets(); 
    
    const [editingBalance, setEditingBalance] = useState<"total" | "monthly" | "income" | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        // This ensures the date is only set on the client, avoiding hydration mismatches.
        setCurrentDate(new Date());
    }, []);
    
    const { referenceDate, hasTransactions } = useMemo(() => {
        if (transactions.length > 0) {
            return { referenceDate: currentDate, hasTransactions: true };
        }
        return { referenceDate: currentDate, hasTransactions: false };
    }, [transactions.length, currentDate]);
    
    const monthName = format(referenceDate, 'MMMM');

    const thisMonthInterval = useMemo(() => ({ start: startOfMonth(referenceDate), end: endOfMonth(referenceDate) }), [referenceDate]);
    const lastMonthInterval = useMemo(() => {
        const lastMonth = subMonths(referenceDate, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }, [referenceDate]);

    const isWeeklyBudget = (budget: Budget) => {
        const duration = differenceInDays(new Date(budget.endDate), new Date(budget.startDate));
        return duration >= 6 && duration <= 8;
    };

    const isMonthlyBudget = (budget: Budget) => {
        const budgetStart = startOfDay(new Date(budget.startDate));
        const budgetEnd = endOfDay(new Date(budget.endDate));
        return isEqual(budgetStart, startOfMonth(budgetStart)) && isEqual(budgetEnd, endOfMonth(budgetStart));
    }

    const currentMonthlyBudget = useMemo(() => {
        return budgets.find(b => {
            const budgetStart = startOfDay(new Date(b.startDate));
            const budgetEnd = endOfDay(new Date(b.endDate));
            return isWithinInterval(currentDate, { start: budgetStart, end: budgetEnd }) && isMonthlyBudget(b);
        });
    }, [budgets, currentDate]);

    const currentWeeklyBudget = useMemo(() => {
        return budgets.find(b => {
            const budgetStart = startOfDay(new Date(b.startDate));
            const budgetEnd = endOfDay(new Date(b.endDate));
            return isWithinInterval(currentDate, { start: budgetStart, end: budgetEnd }) && isWeeklyBudget(b);
        });
    }, [budgets, currentDate]);

    const [selectedWeeklyBudget, setSelectedWeeklyBudget] = useState<Budget | undefined>(currentWeeklyBudget);
    const [selectedMonthlyBudget, setSelectedMonthlyBudget] = useState<Budget | undefined>(currentMonthlyBudget);


    const selectableWeeklyBudgets = useMemo(() => {
        return budgets.filter(isWeeklyBudget);
    }, [budgets]);
    
    const selectableMonthlyBudgets = useMemo(() => {
        const currentYear = getYear(currentDate);
        return budgets.filter(b => {
            const budgetStart = startOfDay(new Date(b.startDate));
            return getYear(budgetStart) === currentYear && isMonthlyBudget(b);
        });
    }, [budgets, currentDate]);

    const handleUpdateBudget = (newGoal: number, budgetToUpdate: Budget | undefined) => {
        if (!budgetToUpdate) return;
        
        updateBudget({
            ...budgetToUpdate,
            goal: newGoal
        });
        
        if (isMonthlyBudget(budgetToUpdate)) {
            setSelectedMonthlyBudget({ ...budgetToUpdate, goal: newGoal });
        } else {
            setSelectedWeeklyBudget({ ...budgetToUpdate, goal: newGoal });
        }
    };


    const monthlySummary = useMemo(() => {
        const thisMonthIncome = transactions.filter(t => t.type === 'income' && isWithinInterval(parseISO(t.date), thisMonthInterval)).reduce((acc, t) => acc + t.amount, 0);
        const thisMonthExpenses = transactions.filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), thisMonthInterval)).reduce((acc, t) => acc + t.amount, 0);
        const thisMonthBalance = thisMonthIncome - thisMonthExpenses;

        const lastMonthIncome = transactions.filter(t => t.type === 'income' && isWithinInterval(parseISO(t.date), lastMonthInterval)).reduce((acc, t) => acc + t.amount, 0);
        const lastMonthExpenses = transactions.filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), lastMonthInterval)).reduce((acc, t) => acc + t.amount, 0);
        const lastMonthBalance = lastMonthIncome - lastMonthExpenses;

        const incomeComparison = calculatePercentageChange(thisMonthIncome, lastMonthIncome);
        const balanceComparison = calculatePercentageChange(thisMonthBalance, lastMonthBalance);

        return { thisMonthIncome, thisMonthBalance, incomeComparison, balanceComparison };
    }, [transactions, thisMonthInterval, lastMonthInterval]);


    const savingsSummary = useMemo(() => {
        const totalSavings = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
        
        const thisMonthSavings = monthlySummary.thisMonthIncome - transactions.filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), thisMonthInterval)).reduce((sum, t) => sum + t.amount, 0);
        
        const lastMonthSavings = transactions.filter(t => isWithinInterval(parseISO(t.date), lastMonthInterval))
            .reduce((acc, t) => (t.type === 'income' ? acc + t.amount : acc - t.amount), 0);

        const savingsComparison = calculatePercentageChange(thisMonthSavings, lastMonthSavings);
        
        return { totalSavings, savingsComparison };
    }, [transactions, monthlySummary.thisMonthIncome, thisMonthInterval, lastMonthInterval]);
    

    const handleUpdateBalance = (newBalance: number) => {
        let adjustment: number;
        let title: string;
        let date: string;

        if (editingBalance === 'total') {
            adjustment = newBalance - savingsSummary.totalSavings;
            title = "Balance Adjustment (Total)";
            date = new Date().toISOString(); 
        } else if (editingBalance === 'monthly') {
            adjustment = newBalance - monthlySummary.thisMonthBalance;
            title = "Balance Adjustment (Monthly)";
            date = referenceDate.toISOString(); 
        } else if (editingBalance === 'income') {
            adjustment = newBalance - monthlySummary.thisMonthIncome;
            title = "Income Adjustment";
            date = referenceDate.toISOString();
        } else {
            return;
        }

        addTransaction({
            id: uuidv4(),
            type: adjustment >= 0 ? 'income' : 'expense',
            amount: Math.abs(adjustment),
            category: 'Adjustment',
            title: title,
            date: date,
        });

        setEditingBalance(null);
    };
    
    const getModalInfo = () => {
        switch (editingBalance) {
            case 'total':
                return { title: 'Edit Total Savings', currentBalance: savingsSummary.totalSavings };
            case 'monthly':
                return { title: "Edit Month's Balance", currentBalance: monthlySummary.thisMonthBalance };
            case 'income':
                 return { title: "Edit Month's Income", currentBalance: monthlySummary.thisMonthIncome };
            default:
                return { title: '', currentBalance: 0 };
        }
    };

    const weeklyInterval = useMemo(() => {
        if (selectedWeeklyBudget) {
            return { start: new Date(selectedWeeklyBudget.startDate), end: new Date(selectedWeeklyBudget.endDate) };
        }
        return { start: startOfWeek(currentDate), end: endOfWeek(currentDate) };
    }, [selectedWeeklyBudget, currentDate]);

    const modalInfo = getModalInfo();
    
    const budgetForWeeklyCard = selectedWeeklyBudget || currentWeeklyBudget;
    const budgetForMonthlyCard = selectedMonthlyBudget || currentMonthlyBudget;

  return (
    <>
      <ReminderModal />
      <div className="space-y-6">
        
        {/* ✅ 2. Insert QuickActions here at the top */}
        <QuickActions />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            title={hasTransactions ? `${monthName}'s Income` : "Month's Income"}
            amount={monthlySummary.thisMonthIncome}
            comparison={monthlySummary.incomeComparison}
            icon={<IndianRupee className="h-5 w-5 text-muted-foreground" />}
            onEdit={() => setEditingBalance('income')}
          />
          <SummaryCard
            title={hasTransactions ? `${monthName}'s Balance` : "Month's Balance"}
            amount={monthlySummary.thisMonthBalance}
            comparison={monthlySummary.balanceComparison}
            icon={<CircleDollarSign className="h-5 w-5 text-muted-foreground" />}
            onEdit={() => setEditingBalance('monthly')}
          />
          <SummaryCard
            title="Total Savings"
            amount={savingsSummary.totalSavings}
            comparison={savingsSummary.savingsComparison}
            icon={<Wallet className="h-5 w-5 text-muted-foreground" />}
            onEdit={() => setEditingBalance('total')}
          />
        </div>

       <div className="grid gap-4 md:grid-cols-2">
         <DashboardBudgetCard
           title="Selected Weekly Budget"
           budget={budgetForWeeklyCard}
           selectableBudgets={selectableWeeklyBudgets}
           onSelectBudget={setSelectedWeeklyBudget}
           onUpdateBudget={(newGoal) => handleUpdateBudget(newGoal, budgetForWeeklyCard)}
         />
          <DashboardBudgetCard
            title="Selected Monthly Budget"
            budget={budgetForMonthlyCard}
            selectableBudgets={selectableMonthlyBudgets}
            onSelectBudget={setSelectedMonthlyBudget}
            onUpdateBudget={(newGoal) => handleUpdateBudget(newGoal, budgetForMonthlyCard)}
          />
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingOverviewChart 
            referenceDate={currentDate} 
            weekStartDate={weeklyInterval.start}
            weekEndDate={weeklyInterval.end}
        />
        <SpendingFlowChart 
          weeklyBudgets={selectableWeeklyBudgets}
          monthlyBudgets={selectableMonthlyBudgets}
          currentDate={currentDate}
        />
      </div>
      <div>
        <AIInsights />
      </div>
    </div>
     <EditBalanceModal
       isOpen={!!editingBalance}
       onClose={() => setEditingBalance(null)}
       onUpdateBalance={handleUpdateBalance}
       title={modalInfo.title}
       currentBalance={modalInfo.currentBalance}
     />
    </>
  );
}