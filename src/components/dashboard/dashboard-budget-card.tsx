"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, Check, Pencil, X } from "lucide-react";
import type { Budget } from "@/lib/types";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type DashboardBudgetCardProps = {
  title: string;
  budget: Budget | undefined;
  selectableBudgets?: Budget[];
  onSelectBudget?: (budget: Budget) => void;
  onUpdateBudget?: (newGoal: number) => void;
};

export default function DashboardBudgetCard({
  title,
  budget,
  selectableBudgets,
  onSelectBudget,
  onUpdateBudget
}: DashboardBudgetCardProps) {
  const { currencySymbol } = useCurrency();
  
  // Local edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const spent = budget?.spent || 0;
  const goal = budget?.goal || 0;
  
  // LOGIC: Math for progress
  const progress = goal > 0 ? (spent / goal) * 100 : 0;
  const remaining = goal - spent;
  const isBudgetReached = spent >= goal && goal > 0;

  const Icon = selectableBudgets ? Calendar : Target;
  
  const popoverTitle = title.includes("Weekly") ? "Select a Weekly Budget" : "Select a Monthly Budget";
  const popoverDescription = title.includes("Weekly") 
    ? "Choose a weekly budget to display."
    : "Choose a monthly budget to display.";
  const noBudgetsMessage = title.includes("Weekly") 
    ? "No weekly budgets found." 
    : "No monthly budgets found.";

  const dateRange = budget
    ? `${format(new Date(budget.startDate), "MMM d")} - ${format(new Date(budget.endDate), "MMM d, yyyy")}`
    : "Not set";

  // ------------------------------------------------------------------
  //  NEW COLOR LOGIC (With '!' to force colors over theme)
  // ------------------------------------------------------------------
  let progressColorClass = "[&>div]:!bg-green-500"; // 0% - 49% (Safe/Green)
  
  if (progress >= 80) {
    progressColorClass = "[&>div]:!bg-red-600";    // 80% - 100% (Danger/Red)
  } else if (progress >= 50) {
    progressColorClass = "[&>div]:!bg-orange-500"; // 50% - 79% (Warning/Little Red)
  }

  // LOGIC: Save Function
  const handleSave = () => {
    const newAmount = parseFloat(editValue);
    if (!isNaN(newAmount) && newAmount > 0) {
      if (onUpdateBudget) {
        onUpdateBudget(newAmount);
      }
      setIsEditing(false); // Close the input box
    }
  };

  const startEditing = () => {
    setEditValue(goal.toString());
    setIsEditing(true);
  };

  return (
    <Card className="shadow-md shadow-primary/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {selectableBudgets && onSelectBudget ? (
           <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">{popoverTitle}</h4>
                  <p className="text-sm text-muted-foreground">
                    {popoverDescription}
                  </p>
                </div>
                <div className="grid gap-2">
                  {selectableBudgets.length > 0 ? selectableBudgets.map(b => (
                    <Button
                      key={b.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-between",
                        budget?.id === b.id && "bg-accent"
                      )}
                      onClick={() => onSelectBudget(b)}
                    >
                      <div>
                        <p className="font-semibold text-left">{b.name}</p>
                        <p className="text-xs text-muted-foreground text-left">{`${format(new Date(b.startDate), "MMM d")} - ${format(new Date(b.endDate), "MMM d")}`}</p>
                      </div>
                      {budget?.id === b.id && <Check className="h-4 w-4" />}
                    </Button>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">{noBudgetsMessage}</p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Icon className="h-5 w-5 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        {goal > 0 && budget ? (
          <>
            <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{currencySymbol}{spent.toLocaleString()}</span>
                
                {isEditing ? (
                    <div className="flex items-center gap-1 ml-2">
                        <Input 
                            type="number" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8 w-24"
                            autoFocus
                        />
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSave}>
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setIsEditing(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 group">
                        <span className="text-sm text-muted-foreground">
                        / {currencySymbol}{goal.toLocaleString()}
                        </span>
                        {/* Edit Button */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-50 group-hover:opacity-100 transition-opacity"
                            onClick={startEditing}
                        >
                            <Pencil className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </div>
            
            <p className="text-xs text-muted-foreground font-semibold pb-1 mt-1">{budget.name}</p>
            
            {/* UPDATED PROGRESS BAR: Uses !bg-color to force style */}
            <Progress 
                value={progress > 100 ? 100 : progress} 
                className={cn("h-2 my-2", progressColorClass)} 
            />

            <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                     {remaining >= 0 ? `${currencySymbol}${remaining.toLocaleString()} left` : `${currencySymbol}${Math.abs(remaining).toLocaleString()} over`}
                </p>
                <p className="text-xs text-muted-foreground">{dateRange}</p>
            </div>

            {isBudgetReached && (
                <div className="mt-4 p-2 bg-red-100 border border-red-200 rounded-md flex items-center gap-2">
                    <span className="text-red-600 font-bold text-sm">⚠️ Budget Reached!</span>
                    <span className="text-red-600 text-xs">Limit: {currencySymbol}{goal.toLocaleString()}.</span>
                </div>
            )}
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{currencySymbol}0</div>
             <p className="text-xs text-muted-foreground">No budget set.</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}