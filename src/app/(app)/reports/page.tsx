
"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTransactions } from "@/hooks/use-transactions";
import type { Transaction } from "@/lib/types";
import CategoryIcon from "@/components/shared/category-icon";
import { format, parseISO } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { AreaChart } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";

type SpendingByCategory = {
  category: string;
  total: number;
  transactions: Transaction[];
  percentage: number;
};

export default function ReportsPage() {
  const { transactions } = useTransactions();
  const { currencySymbol } = useCurrency();

  const spendingReport = useMemo(() => {
    const expenseTransactions = transactions.filter((t) => t.type === "expense");
    const totalSpent = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

    if (totalSpent === 0) return [];

    const categoryMap: { [key: string]: { total: number; transactions: Transaction[] } } = {};

    expenseTransactions.forEach((t) => {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = { total: 0, transactions: [] };
      }
      categoryMap[t.category].total += t.amount;
      categoryMap[t.category].transactions.push(t);
    });
    
    const report: SpendingByCategory[] = Object.entries(categoryMap)
      .map(([category, data]) => ({
        category,
        total: data.total,
        transactions: data.transactions.sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
        percentage: (data.total / totalSpent) * 100,
      }))
      .sort((a, b) => b.total - a.total);

    return report;
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Expense Report</CardTitle>
          <CardDescription>
            A detailed breakdown of your spending by category, sorted from highest to lowest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {spendingReport.length > 0 ? (
            <>
            <div className="mb-6">
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-3xl font-bold">{currencySymbol}{totalExpenses.toLocaleString()}</p>
            </div>
            <Accordion
              type="multiple"
              defaultValue={[spendingReport[0]?.category]}
              className="w-full"
            >
              {spendingReport.map(({ category, total, transactions, percentage }) => (
                <AccordionItem value={category} key={category}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4 w-full">
                       <div className="bg-muted p-2 rounded-lg">
                         <CategoryIcon category={category} />
                       </div>
                       <div className="flex-1 text-left">
                            <div className="flex justify-between items-baseline">
                                <p className="font-semibold">{category}</p>
                                <p className="font-bold text-lg text-primary">{currencySymbol}{total.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Progress value={percentage} className="h-2" />
                                <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                                    {percentage.toFixed(1)}%
                                </span>
                            </div>
                       </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-4 border-l-2 ml-6">
                        {transactions.map(t => (
                            <div key={t.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                                <div>
                                    <p className="font-medium">{t.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(parseISO(t.date), "MMM d, yyyy")}
                                    </p>
                                </div>
                                <p className="font-semibold text-red-500">-{currencySymbol}{t.amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            </>
          ) : (
             <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                <AreaChart className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">No Expense Data</h3>
                <p className="mt-1 text-sm">Add some expenses to see your report.</p>
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
