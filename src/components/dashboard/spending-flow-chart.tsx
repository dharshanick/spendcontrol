"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";
import { useTransactions } from "@/hooks/use-transactions";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

// --- VIBRANT COLOR PALETTE ---
const COLORS = [
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#eab308", // Yellow
  "#f97316", // Orange
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#ef4444", // Red
];

export default function SpendingFlowChart({ weeklyBudgets, monthlyBudgets, currentDate }: any) {
  const { currencySymbol } = useCurrency();
  const { transactions } = useTransactions();
  const [timeRange, setTimeRange] = useState("Monthly");

  const chartData = useMemo(() => {
    const today = currentDate || new Date();
    let start, end;

    // 1. Determine Date Range
    if (timeRange === "Weekly") {
      start = startOfWeek(today, { weekStartsOn: 1 });
      end = endOfWeek(today, { weekStartsOn: 1 });
    } else {
      start = startOfMonth(today);
      end = endOfMonth(today);
    }

    // 2. Filter Expenses for this range
    const relevantTransactions = transactions.filter(
      (t) => t.type === "expense" && isWithinInterval(parseISO(t.date), { start, end })
    );

    // 3. Group by Category
    const categoryMap: Record<string, number> = {};
    relevantTransactions.forEach((t) => {
      const cat = t.category || "Uncategorized";
      categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
    });

    // 4. Convert to Array for Chart
    const data: { name: string; value: number; isEmpty?: boolean }[] = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
    }));

    // 5. Handle "No Data" case
    if (data.length === 0) {
      return [{ name: "No spending data", value: 1, isEmpty: true }];
    }

    return data;
  }, [transactions, timeRange, currentDate]);

  return (
    <Card className="col-span-4 shadow-md shadow-primary/10 h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Spending Categories</CardTitle>
          <Select defaultValue="Monthly" onValueChange={setTimeRange}>
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Your expense distribution by category.
        </p>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="h-[250px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={chartData[0].isEmpty ? 0 : 5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isEmpty ? "#333" : COLORS[index % COLORS.length]}
                    className={entry.isEmpty ? "opacity-20" : ""}
                  />
                ))}
              </Pie>

              {!chartData[0].isEmpty && (
                <Tooltip
                  formatter={(value: number) => `${currencySymbol}${value}`}
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
              )}

              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value, entry: any) => (
                  <span className="text-xs text-muted-foreground ml-1">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text if Empty */}
          {chartData[0].isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs text-muted-foreground">No spending data</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
