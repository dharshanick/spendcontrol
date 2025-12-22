"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Target, Zap } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import Link from "next/link";

export default function QuickActions() {
  const { setAddIncomeModalOpen, setAddExpenseModalOpen } = useTransactions() as any;

  return (
    <Card className="mb-6 shadow-md border-primary/10">
      <CardHeader className="pb-2 md:pb-3 pt-4 px-4">
        <CardTitle className="text-sm md:text-lg font-semibold flex items-center gap-2">
          <Zap className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 fill-yellow-500" /> Quick Actions
        </CardTitle>
      </CardHeader>
      
      {/* CHANGED: grid-cols-3 instead of grid-cols-1. Keeps them in one row on mobile. */}
      <CardContent className="grid grid-cols-3 gap-2 md:gap-4 px-4 pb-4">
        
        {/* 1. Add Income */}
        <Button
          className="h-auto py-2 md:py-4 flex flex-col gap-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900"
          variant="outline"
          onClick={() => setAddIncomeModalOpen(true)}
        >
          {/* Smaller icon/padding on mobile */}
          <div className="p-1.5 md:p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
            <TrendingUp className="h-4 w-4 md:h-6 md:w-6" />
          </div>
          <span className="text-xs md:text-base font-bold text-center">Add Income</span>
        </Button>

        {/* 2. Add Expense */}
        <Button
          className="h-auto py-2 md:py-4 flex flex-col gap-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900"
          variant="outline"
          onClick={() => setAddExpenseModalOpen(true)}
        >
          <div className="p-1.5 md:p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
            <TrendingDown className="h-4 w-4 md:h-6 md:w-6" />
          </div>
          <span className="text-xs md:text-base font-bold text-center">Add Expense</span>
        </Button>

        {/* 3. Add Budget */}
        <Link href="/budgets" className="w-full">
            <Button
              className="w-full h-full py-2 md:py-4 flex flex-col gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900"
              variant="outline"
            >
              <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                <Target className="h-4 w-4 md:h-6 md:w-6" />
              </div>
              <span className="text-xs md:text-base font-bold text-center">Set Budget</span>
            </Button>
        </Link>
      </CardContent>
    </Card>
  );
}