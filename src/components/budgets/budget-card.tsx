
"use client";

import { AlertCircle, CalendarDays, MoreVertical, Target, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { format } from "date-fns";
import type { Budget } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useCurrency } from "@/hooks/use-currency";

type BudgetCardProps = {
  budget: Budget;
  onDelete: () => void;
};

export default function BudgetCard({ budget, onDelete }: BudgetCardProps) {
  const { currencySymbol } = useCurrency();
  const { name, goal, spent, startDate, endDate } = budget;
  const progress = goal > 0 ? (spent / goal) * 100 : 0;
  const remaining = goal - spent;

  const getStatus = () => {
    if (progress > 100)
      return {
        message: "You've exceeded your budget.",
        variant: "destructive",
        icon: <TrendingDown className="h-4 w-4" />,
      };
    if (progress >= 90)
      return {
        message: "You're approaching your budget limit.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />,
      };
    return {
      message: "You're on track.",
      variant: "default",
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
    };
  };

  const status = getStatus();

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{name} Budget</CardTitle>
            <CardDescription className="flex items-center gap-2 pt-1">
                <CalendarDays className="h-4 w-4" />
                {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold">{currencySymbol}{spent.toLocaleString()}</span>
            <span className="text-muted-foreground">
              / {currencySymbol}{goal.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="text-sm text-muted-foreground mt-2">
            {remaining >= 0 ? (
              <p>
                <span className="font-semibold text-green-500">
                  {currencySymbol}{remaining.toLocaleString()}
                </span>{" "}
                left to spend
              </p>
            ) : (
              <p>
                <span className="font-semibold text-destructive">
                  {currencySymbol}{Math.abs(remaining).toLocaleString()}
                </span>{" "}
                over budget
              </p>
            )}
          </div>
        </div>
        <Alert
          variant={status.variant as "default" | "destructive"}
          className="mt-6"
        >
          {status.icon}
          <AlertTitle
            className={cn(
              status.variant === "destructive" ? "text-destructive" : ""
            )}
          >
            {status.message}
          </AlertTitle>
        </Alert>
      </CardContent>
    </Card>
  );
}
