"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Edit2, Check, X, Trash2 } from "lucide-react"; // Added Trash2
import { useCurrency } from "@/hooks/use-currency";
import { format, parseISO } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Budget } from "@/lib/types";
import { useState } from "react";

interface DashboardBudgetCardProps {
  title: string;
  budget: (Budget & { spent: number }) | undefined;
  selectableBudgets: Budget[];
  onSelectBudget: (budget: Budget) => void;
  onUpdateBudget: (newGoal: number) => void;
  onDelete: () => void; // NEW: Delete handler
}

export default function DashboardBudgetCard({
  title,
  budget,
  selectableBudgets,
  onSelectBudget,
  onUpdateBudget,
  onDelete, // Destructure new prop
}: DashboardBudgetCardProps) {
  const { currencySymbol } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  if (!budget) {
    return (
      <Card className="h-full border-dashed shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[100px] text-center">
            <p className="text-2xl font-bold text-muted-foreground/50">
              {currencySymbol}0
            </p>
            <p className="text-xs text-muted-foreground mt-1">No budget set.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const percentage = Math.min(100, Math.max(0, (budget.spent / budget.goal) * 100));
  const remaining = budget.goal - budget.spent;
  const isOverBudget = remaining < 0;
  const dateRange = `${format(parseISO(budget.startDate), "MMM d")} - ${format(parseISO(budget.endDate), "MMM d, yyyy")}`;

  const startEditing = () => {
    setEditValue(budget.goal.toString());
    setIsEditing(true);
  };

  const saveEdit = () => {
    const newVal = parseFloat(editValue);
    if (!isNaN(newVal) && newVal > 0) {
      onUpdateBudget(newVal);
    }
    setIsEditing(false);
  };

  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow relative group">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex flex-col">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {selectableBudgets.length > 1 ? (
            <Select
              value={budget.id}
              onValueChange={(val) => {
                const selected = selectableBudgets.find((b) => b.id === val);
                if (selected) onSelectBudget(selected);
              }}
            >
              <SelectTrigger className="h-5 p-0 text-xs text-muted-foreground border-none shadow-none focus:ring-0 w-fit gap-1">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                {selectableBudgets.map(b => (
                  <SelectItem key={b.id} value={b.id} className="text-xs">
                    {format(parseISO(b.startDate), "MMM d")} - {format(parseISO(b.endDate), "MMM d")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {dateRange}
            </span>
          )}
        </div>

        {/* --- ACTIONS: EDIT & DELETE --- */}
        {!isEditing ? (
          <div className="flex items-center gap-1">
            {/* EDIT BUTTON */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={startEditing}
              title="Edit Amount"
            >
              <Edit2 className="h-3 w-3" />
            </Button>

            {/* NEW: DELETE BUTTON */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              onClick={() => {
                if (confirm("Delete this budget?")) onDelete();
              }}
              title="Delete Budget"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-green-500 hover:bg-green-500/10" onClick={saveEdit}>
              <Check className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-500/10" onClick={() => setIsEditing(false)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">
            {currencySymbol}{Math.round(budget.spent).toLocaleString()}
          </span>
          <span className="text-muted-foreground text-sm font-medium">/</span>

          {isEditing ? (
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-7 w-24 text-sm px-2 py-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
            />
          ) : (
            <span className="text-muted-foreground text-sm font-medium">
              {currencySymbol}{budget.goal.toLocaleString()}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <Progress
            value={percentage}
            className="h-2"
            style={{ '--progress-background': isOverBudget ? '#ef4444' : '#22c55e' } as any}
          />
          <div className="flex justify-between items-center text-xs mt-1">
            <span className={isOverBudget ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
              {currencySymbol}{Math.abs(remaining).toLocaleString()} {isOverBudget ? "over" : "left"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}