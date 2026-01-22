"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target } from "lucide-react";
import AddIncomeModal from "@/components/shared/add-income-modal";
import AddExpenseModal from "@/components/shared/add-expense-modal";
import { useRouter } from "next/navigation";

export default function QuickActions() {
  const router = useRouter();
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const handleSetBudget = () => {
    router.push("/budgets");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <div className="h-5 w-1 bg-yellow-500 rounded-full"></div>
        Quick Actions
      </h2>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {/* ADD INCOME - Enhanced Contrast */}
        <Card
          className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 border-2 border-green-500/20 bg-green-100 dark:bg-green-950/20"
          onClick={() => setIsIncomeModalOpen(true)}
        >
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-500 flex items-center justify-center shadow-md">
            <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-white" />
          </div>
          {/* Fixed text color for light mode: text-green-800 instead of 700 */}
          <span className="text-xs md:text-sm font-extrabold text-green-800 dark:text-green-400 text-center">
            Add Income
          </span>
        </Card>

        {/* ADD EXPENSE - Enhanced Contrast */}
        <Card
          className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 border-2 border-red-500/20 bg-red-100 dark:bg-red-950/20"
          onClick={() => setIsExpenseModalOpen(true)}
        >
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-red-500 flex items-center justify-center shadow-md">
            <TrendingDown className="h-6 w-6 md:h-7 md:w-7 text-white" />
          </div>
          <span className="text-xs md:text-sm font-extrabold text-red-800 dark:text-red-400 text-center">
            Add Expense
          </span>
        </Card>

        {/* SET BUDGET - Enhanced Contrast */}
        <Card
          className="p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 border-2 border-blue-500/20 bg-blue-100 dark:bg-blue-950/20"
          onClick={handleSetBudget}
        >
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
            <Target className="h-6 w-6 md:h-7 md:w-7 text-white" />
          </div>
          <span className="text-xs md:text-sm font-extrabold text-blue-800 dark:text-blue-400 text-center">
            Set Budget
          </span>
        </Card>
      </div>

      <AddIncomeModal isOpen={isIncomeModalOpen} onClose={() => setIsIncomeModalOpen(false)} />
      <AddExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} />
    </div>
  );
}