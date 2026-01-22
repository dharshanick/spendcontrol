"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";
import { useTransactions } from "@/hooks/use-transactions";
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, isWithinInterval, parseISO
} from "date-fns";

const COLORS = [
  "#22c55e", "#3b82f6", "#eab308", "#f97316",
  "#a855f7", "#ec4899", "#06b6d4", "#ef4444",
];

export default function SpendingFlowChart({ currentDate }: { currentDate: Date }) {
  const { currencySymbol } = useCurrency();
  const { transactions } = useTransactions();
  const [timeRange, setTimeRange] = useState("Monthly");

  const chartData = useMemo(() => {
    const today = currentDate || new Date();
    let start, end;

    // ALGORITHM: Determine Date Range strictly based on 'today'
    if (timeRange === "Weekly") {
      start = startOfWeek(today, { weekStartsOn: 1 });
      end = endOfWeek(today, { weekStartsOn: 1 });
    } else if (timeRange === "Monthly") {
      start = startOfMonth(today);
      end = endOfMonth(today);
    } else {
      // Yearly
      start = startOfYear(today);
      end = endOfYear(today);
    }

    // Filter Expenses only within the calculated window
    const relevantTransactions = transactions.filter(
      (t) => t.type === "expense" && isWithinInterval(parseISO(t.date), { start, end })
    );

    // Group by Category
    const categoryMap: Record<string, number> = {};
    relevantTransactions.forEach((t) => {
      const cat = t.category || "Uncategorized";
      categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
    });

    const data: { name: string; value: number; isEmpty?: boolean }[] = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
    }));

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
              <SelectItem value="Yearly">Yearly</SelectItem>
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
                {chartData.map((entry: any, index: number) => (
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
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground ml-1">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
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
