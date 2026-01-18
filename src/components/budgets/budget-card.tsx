"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trash2, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { format, parseISO } from "date-fns";

interface BudgetCardProps {
  budget: any;
  onDelete: () => void;
}

export default function BudgetCard({ budget, onDelete }: BudgetCardProps) {
  const { currencySymbol } = useCurrency();

  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, (budget.spent / budget.goal) * 100));
  const remaining = budget.goal - budget.spent;
  const isOverBudget = remaining < 0;

  // Format Dates
  const dateRange = `${format(parseISO(budget.startDate), 'MMM d')} - ${format(parseISO(budget.endDate), 'MMM d, yyyy')}`;

  return (
    <Card className="border border-zinc-800 bg-black/40 hover:bg-black/60 transition-all group relative overflow-hidden">

      {/* Background Glow based on status */}
      <div className={`absolute top-0 left-0 w-1 h-full ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}></div>

      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold">{budget.name}</CardTitle>
          <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
            <Calendar className="h-3 w-3" />
            {dateRange}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onDelete} className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* Money Stats */}
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-white">
            {currencySymbol}{budget.spent.toLocaleString()}
          </span>
          <span className="text-muted-foreground mb-1">
            / {currencySymbol}{budget.goal.toLocaleString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress
            value={percentage}
            className={`h-2 ${isOverBudget ? 'bg-red-900/20' : 'bg-zinc-800'}`}
            // We need to style the indicator specifically in globals.css or inline style if component supports custom indicator class
            // For standard shadcn/ui, the indicator color is often derived from 'bg-primary'.
            // To force color:
            style={{
              '--progress-background': isOverBudget ? '#ef4444' : '#22c55e'
            } as any}
          />

          <div className="flex justify-between text-sm font-medium">
            <span className={isOverBudget ? "text-red-400" : "text-green-500"}>
              {isOverBudget
                ? `${currencySymbol}${Math.abs(remaining).toLocaleString()} over budget`
                : `${currencySymbol}${remaining.toLocaleString()} left to spend`
              }
            </span>
            <span className="text-muted-foreground">{Math.round(percentage)}%</span>
          </div>
        </div>

        {/* Status Message */}
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${isOverBudget ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
          {isOverBudget ? <AlertCircle className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
          <span>
            {isOverBudget
              ? "You've exceeded your budget limit."
              : "You're on track to save this period."}
          </span>
        </div>

      </CardContent>
    </Card>
  );
}
