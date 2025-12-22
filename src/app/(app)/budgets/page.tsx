
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BudgetCard from "@/components/budgets/budget-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddBudgetModal from "@/components/budgets/add-budget-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Budget } from "@/lib/types";
import { useBudgets } from "@/hooks/use-budgets";


export default function BudgetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const { budgets, addBudget, deleteBudget } = useBudgets();
  

  const handleDeleteBudget = () => {
    if (budgetToDelete) {
      deleteBudget(budgetToDelete);
      toast({
        title: "Budget Deleted",
        description: "The budget has been successfully removed.",
      });
      setBudgetToDelete(null);
    }
  };


  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Budgets</CardTitle>
              <CardDescription>
                Set spending goals and track your progress to save more.
              </CardDescription>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2" />
              Add New Budget
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onDelete={() => setBudgetToDelete(budget.id)}
                />
              ))}
            </div>
             {budgets.length === 0 && (
              <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                  <p>No budgets set. Click "Add New Budget" to get started.</p>
              </div>
          )}
          </CardContent>
        </Card>
      </div>
      <AddBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddBudget={addBudget}
      />
      <AlertDialog open={!!budgetToDelete} onOpenChange={() => setBudgetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this budget.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBudget}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
