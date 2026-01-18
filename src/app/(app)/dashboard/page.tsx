"use client";

import SummaryCard from "@/components/dashboard/summary-card";
import { useTransactions } from "@/hooks/use-transactions";
import { CircleDollarSign, IndianRupee, Wallet } from "lucide-react";
import SpendingOverviewChart from "@/components/dashboard/spending-overview-chart";
import SpendingFlowChart from "@/components/dashboard/spending-flow-chart";
import AIInsights from "@/components/dashboard/ai-insights";
import { useMemo, useState, useEffect } from "react";
import { endOfMonth, isWithinInterval, parseISO, startOfMonth, subMonths, format, startOfDay, endOfDay, isEqual, startOfWeek, endOfWeek, differenceInDays, getYear } from "date-fns";
import { useBudgets } from "@/hooks/use-budgets";
import DashboardBudgetCard from "@/components/dashboard/dashboard-budget-card";
import EditBalanceModal from "@/components/dashboard/edit-balance-modal";
import { v4 as uuidv4 } from 'uuid';
import ReminderModal from "@/components/reminders/reminder-modal";
import type { Budget, Transaction } from "@/lib/types";
import QuickActions from "@/components/dashboard/quick-actions";

const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

export default function DashboardPage() {
    const { transactions, addTransaction } = useTransactions();
    // FIX: Destructure removeBudget
    const { budgets, updateBudget, removeBudget } = useBudgets();

    const [editingBalance, setEditingBalance] = useState<"total" | "monthly" | "income" | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => { setCurrentDate(new Date()); }, []);

    // ... [Logic for dates/summaries - NO CHANGES NEEDED HERE] ...

    const { referenceDate, hasTransactions } = useMemo(() => {
        if (transactions.length > 0) return { referenceDate: currentDate, hasTransactions: true };
        return { referenceDate: currentDate, hasTransactions: false };
    }, [transactions.length, currentDate]);

    const monthName = format(referenceDate, 'MMMM');
    const thisMonthInterval = useMemo(() => ({ start: startOfMonth(referenceDate), end: endOfMonth(referenceDate) }), [referenceDate]);
    const lastMonthInterval = useMemo(() => {
        const lastMonth = subMonths(referenceDate, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }, [referenceDate]);

    // Helpers
    const isWeeklyBudget = (b: Budget) => {
        const d = differenceInDays(new Date(b.endDate), new Date(b.startDate));
        return d >= 6 && d <= 8;
    };
    const isMonthlyBudget = (b: Budget) => {
        const s = startOfDay(new Date(b.startDate));
        const e = endOfDay(new Date(b.endDate));
        return isEqual(s, startOfMonth(s)) && isEqual(e, endOfMonth(s));
    };
    const isYearlyBudget = (b: Budget) => {
        const d = differenceInDays(new Date(b.endDate), new Date(b.startDate));
        return d > 300;
    };

    // --- SELECTION LOGIC ---
    // We try to find a budget that matches the current date first.
    const currentWeeklyBudget = useMemo(() => budgets.find(b => isWeeklyBudget(b) && isWithinInterval(currentDate, { start: startOfDay(new Date(b.startDate)), end: endOfDay(new Date(b.endDate)) })), [budgets, currentDate]);
    const currentMonthlyBudget = useMemo(() => budgets.find(b => isMonthlyBudget(b) && isWithinInterval(currentDate, { start: startOfDay(new Date(b.startDate)), end: endOfDay(new Date(b.endDate)) })), [budgets, currentDate]);
    const currentYearlyBudget = useMemo(() => budgets.find(b => isYearlyBudget(b) && isWithinInterval(currentDate, { start: startOfDay(new Date(b.startDate)), end: endOfDay(new Date(b.endDate)) })), [budgets, currentDate]);

    const [selectedWeeklyBudget, setSelectedWeeklyBudget] = useState<Budget | undefined>(undefined);
    const [selectedMonthlyBudget, setSelectedMonthlyBudget] = useState<Budget | undefined>(undefined);
    const [selectedYearlyBudget, setSelectedYearlyBudget] = useState<Budget | undefined>(undefined);

    // Sync state with found budgets
    useEffect(() => { setSelectedWeeklyBudget(currentWeeklyBudget); }, [currentWeeklyBudget]);
    useEffect(() => { setSelectedMonthlyBudget(currentMonthlyBudget); }, [currentMonthlyBudget]);
    useEffect(() => { setSelectedYearlyBudget(currentYearlyBudget); }, [currentYearlyBudget]);


    const selectableWeeklyBudgets = useMemo(() => budgets.filter(isWeeklyBudget), [budgets]);
    const selectableMonthlyBudgets = useMemo(() => budgets.filter(b => isMonthlyBudget(b) && getYear(new Date(b.startDate)) === getYear(currentDate)), [budgets, currentDate]);
    const selectableYearlyBudgets = useMemo(() => budgets.filter(isYearlyBudget), [budgets]);

    const handleUpdateBudget = (newGoal: number, budgetToUpdate: Budget | undefined) => {
        if (!budgetToUpdate) return;
        updateBudget({ ...budgetToUpdate, goal: newGoal });
    };

    // --- FIX: ROBUST DELETE HANDLER ---
    const handleDeleteBudget = (budget: Budget | undefined) => {
        if (!budget || !budget.id) return;
        removeBudget(budget.id);

        // Clear local selection if we just deleted the selected one
        if (selectedWeeklyBudget?.id === budget.id) setSelectedWeeklyBudget(undefined);
        if (selectedMonthlyBudget?.id === budget.id) setSelectedMonthlyBudget(undefined);
        if (selectedYearlyBudget?.id === budget.id) setSelectedYearlyBudget(undefined);
    };

    // Summaries
    const monthlySummary = useMemo(() => {
        const thisMonthIncome = transactions.filter(t => t.type === 'income' && isWithinInterval(parseISO(t.date), thisMonthInterval)).reduce((acc, t) => acc + t.amount, 0);
        const thisMonthExpenses = transactions.filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), thisMonthInterval)).reduce((acc, t) => acc + t.amount, 0);
        const lastMonthIncome = transactions.filter(t => t.type === 'income' && isWithinInterval(parseISO(t.date), lastMonthInterval)).reduce((acc, t) => acc + t.amount, 0);
        const lastMonthExpenses = transactions.filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), lastMonthInterval)).reduce((acc, t) => acc + t.amount, 0);
        return {
            thisMonthIncome,
            thisMonthBalance: thisMonthIncome - thisMonthExpenses,
            incomeComparison: calculatePercentageChange(thisMonthIncome, lastMonthIncome),
            balanceComparison: calculatePercentageChange(thisMonthIncome - thisMonthExpenses, lastMonthIncome - lastMonthExpenses)
        };
    }, [transactions, thisMonthInterval, lastMonthInterval]);

    const savingsSummary = useMemo(() => {
        const totalSavings = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
        const lastMonthSavings = transactions.filter(t => isWithinInterval(parseISO(t.date), lastMonthInterval)).reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
        return { totalSavings, savingsComparison: calculatePercentageChange(totalSavings, lastMonthSavings) };
    }, [transactions, lastMonthInterval]);

    const handleUpdateBalance = (newBalance: number) => {
        let adjustment: number;
        let title: string;
        let date: string;
        if (editingBalance === 'total') { adjustment = newBalance - savingsSummary.totalSavings; title = "Balance Adjustment (Total)"; date = new Date().toISOString(); }
        else if (editingBalance === 'monthly') { adjustment = newBalance - monthlySummary.thisMonthBalance; title = "Balance Adjustment (Monthly)"; date = referenceDate.toISOString(); }
        else if (editingBalance === 'income') { adjustment = newBalance - monthlySummary.thisMonthIncome; title = "Income Adjustment"; date = referenceDate.toISOString(); }
        else return;
        addTransaction({ id: uuidv4(), type: adjustment >= 0 ? 'income' : 'expense', amount: Math.abs(adjustment), category: 'Adjustment', title: title, date: date });
        setEditingBalance(null);
    };

    const getModalInfo = () => {
        switch (editingBalance) {
            case 'total': return { title: 'Edit Total Savings', currentBalance: savingsSummary.totalSavings };
            case 'monthly': return { title: "Edit Month's Balance", currentBalance: monthlySummary.thisMonthBalance };
            case 'income': return { title: "Edit Month's Income", currentBalance: monthlySummary.thisMonthIncome };
            default: return { title: '', currentBalance: 0 };
        }
    };

    const weeklyInterval = useMemo(() => {
        if (selectedWeeklyBudget) return { start: new Date(selectedWeeklyBudget.startDate), end: new Date(selectedWeeklyBudget.endDate) };
        return { start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) };
    }, [selectedWeeklyBudget, currentDate]);

    const calculateSpent = (budget: Budget, transactions: Transaction[]) => {
        const s = startOfDay(new Date(budget.startDate));
        const e = endOfDay(new Date(budget.endDate));
        return transactions.filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), { start: s, end: e })).reduce((acc, t) => acc + t.amount, 0);
    };

    const budgetForWeeklyCard = useMemo(() => { const b = selectedWeeklyBudget || currentWeeklyBudget; if (!b) return undefined; return { ...b, spent: calculateSpent(b, transactions) }; }, [selectedWeeklyBudget, currentWeeklyBudget, transactions]);
    const budgetForMonthlyCard = useMemo(() => { const b = selectedMonthlyBudget || currentMonthlyBudget; if (!b) return undefined; return { ...b, spent: calculateSpent(b, transactions) }; }, [selectedMonthlyBudget, currentMonthlyBudget, transactions]);
    const budgetForYearlyCard = useMemo(() => { const b = selectedYearlyBudget || currentYearlyBudget; if (!b) return undefined; return { ...b, spent: calculateSpent(b, transactions) }; }, [selectedYearlyBudget, currentYearlyBudget, transactions]);

    const modalInfo = getModalInfo();

    return (
        <>
            <ReminderModal />
            <div className="space-y-6 pb-24">
                <QuickActions />

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-3">
                    <SummaryCard title={hasTransactions ? `${monthName}'s Income` : "Income"} amount={monthlySummary.thisMonthIncome} comparison={monthlySummary.incomeComparison} icon={<IndianRupee className="h-5 w-5 text-muted-foreground" />} onEdit={() => setEditingBalance('income')} />
                    <SummaryCard title={hasTransactions ? `${monthName}'s Balance` : "Balance"} amount={monthlySummary.thisMonthBalance} comparison={monthlySummary.balanceComparison} icon={<CircleDollarSign className="h-5 w-5 text-muted-foreground" />} onEdit={() => setEditingBalance('monthly')} />
                    <SummaryCard title="Savings" amount={savingsSummary.totalSavings} comparison={savingsSummary.savingsComparison} icon={<Wallet className="h-5 w-5 text-muted-foreground" />} onEdit={() => setEditingBalance('total')} />

                    <DashboardBudgetCard
                        title="Weekly"
                        budget={budgetForWeeklyCard}
                        selectableBudgets={selectableWeeklyBudgets}
                        onSelectBudget={setSelectedWeeklyBudget}
                        onUpdateBudget={(newGoal) => handleUpdateBudget(newGoal, budgetForWeeklyCard)}
                        // FIX: Calling the robust delete handler
                        onDelete={() => handleDeleteBudget(budgetForWeeklyCard)}
                    />
                    <DashboardBudgetCard
                        title="Monthly"
                        budget={budgetForMonthlyCard}
                        selectableBudgets={selectableMonthlyBudgets}
                        onSelectBudget={setSelectedMonthlyBudget}
                        onUpdateBudget={(newGoal) => handleUpdateBudget(newGoal, budgetForMonthlyCard)}
                        onDelete={() => handleDeleteBudget(budgetForMonthlyCard)}
                    />
                    <DashboardBudgetCard
                        title="Yearly"
                        budget={budgetForYearlyCard}
                        selectableBudgets={selectableYearlyBudgets}
                        onSelectBudget={setSelectedYearlyBudget}
                        onUpdateBudget={(newGoal) => handleUpdateBudget(newGoal, budgetForYearlyCard)}
                        onDelete={() => handleDeleteBudget(budgetForYearlyCard)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <SpendingOverviewChart referenceDate={currentDate} weekStartDate={weeklyInterval.start} weekEndDate={weeklyInterval.end} />
                    </div>
                    <div className="md:col-span-1">
                        <SpendingFlowChart weeklyBudgets={selectableWeeklyBudgets} monthlyBudgets={selectableMonthlyBudgets} currentDate={currentDate} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <AIInsights />
                </div>
            </div>
            <EditBalanceModal isOpen={!!editingBalance} onClose={() => setEditingBalance(null)} onUpdateBalance={handleUpdateBalance} title={modalInfo.title} currentBalance={modalInfo.currentBalance} />
        </>
    );
}