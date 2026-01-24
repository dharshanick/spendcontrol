"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTransactions } from "@/hooks/use-transactions";
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { RefreshCcw, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SpendingFlowProps {
  currentDate: Date;
}

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef"];

export default function SpendingFlowChart({ currentDate }: SpendingFlowProps) {
  const { transactions } = useTransactions();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeleted, setIsDeleted] = useState(false); // State to control visibility

  const categoryData = useMemo(() => {
    if (isDeleted) return [];

    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    const monthlyExpenses = transactions.filter(t =>
      t.type === 'expense' &&
      isWithinInterval(parseISO(t.date), { start, end })
    );

    const grouped = monthlyExpenses.reduce((acc, curr) => {
      const cat = curr.category || "Uncategorized";
      acc[cat] = (acc[cat] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.keys(grouped).map((cat) => ({
      name: cat,
      value: grouped[cat]
    }));

    return data.sort((a, b) => b.value - a.value);

  }, [transactions, currentDate, refreshKey, isDeleted]);

  const handleRefresh = () => {
    setIsDeleted(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleDelete = () => {
    setIsDeleted(true);
  };

  return (
    <Card className="col-span-1 shadow-sm border-zinc-200 dark:border-zinc-800 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold">Spending Categories</CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            onClick={handleRefresh}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500 cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {categoryData.length > 0 && !isDeleted ? (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart key={refreshKey}>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {categoryData.slice(0, 3).map((item, index) => (
                <div key={item.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground">
            <p className="text-sm">No data to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
