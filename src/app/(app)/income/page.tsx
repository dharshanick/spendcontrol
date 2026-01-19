
"use client";

import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Trash } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import type { Transaction, GroupedTransactions } from "@/lib/types";
import CategoryIcon from "@/components/shared/category-icon";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCurrency } from "@/hooks/use-currency";

const groupTransactionsByDay = (
  transactions: Transaction[]
): GroupedTransactions => {
  return transactions.reduce((acc: GroupedTransactions, transaction) => {
    const day = format(parseISO(transaction.date), "PPP");
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(transaction);
    return acc;
  }, {});
};

export default function IncomePage() {
  const { transactions, deleteTransaction } = useTransactions();
  const { currencySymbol } = useCurrency();
  const { toast } = useToast();

  const incomeTransactions = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "income")
        .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
    [transactions]
  );

  const groupedTransactions = useMemo(
    () => groupTransactionsByDay(incomeTransactions),
    [incomeTransactions]
  );

  const handleDelete = (transactionId: string) => {
    deleteTransaction(transactionId);
    toast({
      title: "Transaction Deleted",
      description: "The income transaction has been successfully removed.",
    });
  };

  return (
    <>
      <div className="space-y-6 pt-24 pb-24 px-4 min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Income History</CardTitle>
            <CardDescription>
              Review and manage your past income.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(groupedTransactions).map(([day, transactions]) => (
                <div key={day}>
                  <h3 className="font-semibold text-lg mb-2">{day}</h3>
                  <div className="space-y-2">
                    {transactions.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="bg-muted p-2 rounded-lg">
                          <CategoryIcon category={t.category} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{t.title}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <CalendarIcon className="h-3 w-3" />
                            {format(parseISO(t.date), "p")}
                          </p>
                        </div>
                        <div className="font-semibold text-green-500">
                          +{currencySymbol}{t.amount.toFixed(2)}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this transaction.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(t.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {incomeTransactions.length === 0 && (
              <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                <p>No income recorded yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
