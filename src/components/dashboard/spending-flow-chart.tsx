
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTransactions } from "@/hooks/use-transactions";
import { useMemo, useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Legend,
} from "recharts";
import { useCurrency } from "@/hooks/use-currency";
import type { Budget } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { endOfMonth, format, isWithinInterval, parseISO, startOfMonth } from "date-fns";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
  "hsl(var(--accent))",
];

type SpendingFlowChartProps = {
  weeklyBudgets: Budget[];
  monthlyBudgets: Budget[];
  currentDate: Date;
}

export default function SpendingFlowChart({ weeklyBudgets, monthlyBudgets, currentDate }: SpendingFlowChartProps) {
  const { transactions } = useTransactions();
  const { currencySymbol } = useCurrency();
  const [filterType, setFilterType] = useState<"monthly" | "weekly">("monthly");
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | undefined>();
  
  const currentMonth = startOfMonth(currentDate);

  useEffect(() => {
    if (filterType === 'monthly') {
        const currentMonthBudget = monthlyBudgets.find(b => isWithinInterval(currentDate, {start: b.startDate, end: b.endDate}));
        setSelectedBudgetId(currentMonthBudget?.id);
    } else {
        const currentWeekBudget = weeklyBudgets.find(b => isWithinInterval(currentDate, {start: b.startDate, end: b.endDate}));
        setSelectedBudgetId(currentWeekBudget?.id);
    }
  }, [filterType, monthlyBudgets, weeklyBudgets, currentDate]);


  const chartData = useMemo(() => {
    let budget: Budget | undefined;
    if (filterType === 'monthly') {
        budget = monthlyBudgets.find(b => b.id === selectedBudgetId);
    } else {
        budget = weeklyBudgets.find(b => b.id === selectedBudgetId);
    }

    const interval = budget 
      ? { start: budget.startDate, end: budget.endDate }
      : { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };

    const expenses = transactions.filter((t) => t.type === "expense" && isWithinInterval(parseISO(t.date), interval));
    
    if (expenses.length === 0) {
        return [{ name: "No expenses for this period", value: 1, fill: "hsl(var(--muted))" }];
    }

    const categoryTotals = expenses.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = 0;
      }
      acc[t.category] += t.amount;
      return acc;
    }, {} as { [key: string]: number });

    return Object.keys(categoryTotals).map((category, i) => ({
      name: category,
      value: categoryTotals[category],
      fill: COLORS[i % COLORS.length],
    }));
  }, [transactions, filterType, selectedBudgetId, monthlyBudgets, weeklyBudgets, currentDate]);

  const hasData = useMemo(() => {
      return !chartData.some(d => d.name.startsWith("No expenses"));
  }, [chartData]);
  
  const selectableBudgets = filterType === 'monthly' ? monthlyBudgets : weeklyBudgets;

  const getSelectLabel = (budget: Budget) => {
    if (filterType === 'monthly') {
      return format(budget.startDate, "MMMM yyyy");
    }
    return `${format(budget.startDate, "MMM d")} - ${format(budget.endDate, "MMM d")}`;
  };

  return (
    <Card className="shadow-md shadow-primary/10">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
                <CardTitle>Spending Categories</CardTitle>
                <CardDescription>Your expense distribution by category.</CardDescription>
            </div>
            <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
         <div className="pt-4">
          <Select value={selectedBudgetId} onValueChange={setSelectedBudgetId} disabled={selectableBudgets.length === 0}>
              <SelectTrigger>
                  <SelectValue placeholder={`Select a ${filterType === 'monthly' ? 'month' : 'week'}`} />
              </SelectTrigger>
              <SelectContent>
                  {selectableBudgets.map(b => (
                      <SelectItem key={b.id} value={b.id}>
                          {getSelectLabel(b)}
                      </SelectItem>
                  ))}
                  {selectableBudgets.length === 0 && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                          No {filterType} budgets set.
                      </div>
                  )}
              </SelectContent>
          </Select>
         </div>

      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
             {hasData && (
                <Tooltip 
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                            <div className="bg-popover p-2 border rounded-md shadow-lg text-popover-foreground">
                                <p className="font-medium">{payload[0].name}</p>
                                <p className="font-bold text-primary">{currencySymbol}{payload[0].value?.toLocaleString()}</p>
                            </div>
                            );
                        }
                        return null;
                    }}
                />
             )}
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={hasData ? 2 : 0}
              stroke="hsl(var(--background))"
              strokeWidth={3}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            {hasData && (
                <Legend
                    iconType="circle"
                    wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '12px',
                    }}
                />
            )}
             {!hasData && (
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-sm">
                    No spending data
                </text>
             )}
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
