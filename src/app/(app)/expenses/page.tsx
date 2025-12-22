
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  format,
  isWithinInterval,
  parse,
  parseISO,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  isValid,
} from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Edit, Trash, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTransactions } from "@/hooks/use-transactions";
import type { Transaction, GroupedTransactions } from "@/lib/types";
import CategoryIcon from "@/components/shared/category-icon";
import { cn } from "@/lib/utils";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function ExpensesPage() {
  const { transactions, deleteTransaction, setEditingTransaction, setAddExpenseModalOpen } = useTransactions();
  const { currencySymbol } = useCurrency();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"day" | "week" | "month">("day");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [dateInputValue, setDateInputValue] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const today = new Date();
    setSelectedDate(today);
    setDateInputValue(format(today, 'yyyy-MM-dd'));
    setMounted(true);
  }, []);

  const expenseTransactions = useMemo(() => transactions.filter(t => t.type === 'expense'), [transactions]);

  const groupedTransactions = useMemo(() => {
    if (!selectedDate) return {};

    let interval;
    if (filter === "week") {
      interval = { start: startOfWeek(selectedDate, { weekStartsOn: 1 }), end: endOfWeek(selectedDate, { weekStartsOn: 1 }) };
    } else if (filter === "month") {
      interval = { start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) };
    } else { // "day"
      interval = { start: startOfDay(selectedDate), end: endOfDay(selectedDate) };
    }
    
    const transactionsInInterval = expenseTransactions.filter(t => 
        isWithinInterval(parseISO(t.date), interval)
    );
    
    let grouped = groupTransactionsByDay(transactionsInInterval);
    
    const dayKeysInInterval = eachDayOfInterval(interval).map(day => format(day, "PPP"));
    
    const newGrouped: GroupedTransactions = {};
    dayKeysInInterval.forEach(key => {
        if(grouped[key]) {
            newGrouped[key] = grouped[key];
        }
    });

    const sortedKeys = Object.keys(newGrouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    const sortedGrouped: GroupedTransactions = {};
    for (const key of sortedKeys) {
        sortedGrouped[key] = newGrouped[key];
    }

    return sortedGrouped;

  }, [expenseTransactions, filter, selectedDate]);
  
  const hasTransactionsInView = useMemo(() => {
    return Object.values(groupedTransactions).some(dayTransactions => dayTransactions.length > 0);
  }, [groupedTransactions]);

  const handleDelete = () => {
    if (transactionToDelete) {
        deleteTransaction(transactionToDelete);
        toast({
        title: "Transaction Deleted",
        description: "The expense has been successfully removed.",
        });
        setTransactionToDelete(null);
        setSelectedTransaction(null);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setAddExpenseModalOpen(true);
    setSelectedTransaction(null);
  }
  
  const handleDateChange = (dateString: string) => {
    const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
    
    if (isValid(parsedDate)) {
        setSelectedDate(parsedDate);
        setDateInputValue(format(parsedDate, 'yyyy-MM-dd'));
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
          <CardDescription>
            Review and manage your past expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Tabs
                defaultValue="day"
                className="w-full sm:w-auto"
                onValueChange={(value) => setFilter(value as "day" | "week" | "month")}
            >
                <TabsList>
                    <TabsTrigger value="day">Day</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-[240px]">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    value={dateInputValue}
                    onChange={(e) => setDateInputValue(e.target.value)}
                    onBlur={(e) => handleDateChange(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="w-full pl-9"
                    disabled={!mounted}
                />
            </div>
          </div>
        
        {!mounted && <Skeleton className="h-[200px] w-full" />}
        {mounted && (
          <Accordion type="multiple" defaultValue={Object.keys(groupedTransactions)} className="w-full" key={filter + selectedDate?.toISOString()}>
            {Object.keys(groupedTransactions).length > 0 && hasTransactionsInView ? (
              Object.entries(groupedTransactions).map(([day, transactionsForDay]) => (
                <AccordionItem value={day} key={day}>
                  <AccordionTrigger>{day}</AccordionTrigger>
                  <AccordionContent>
                    {transactionsForDay.length > 0 ? (
                      <div className="space-y-1">
                        {transactionsForDay.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                            onClick={() => setSelectedTransaction(t)}
                          >
                            <div className="bg-muted p-2 rounded-lg">
                              <CategoryIcon category={t.category} />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{t.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {t.category}
                              </p>
                            </div>
                            <div className="font-semibold text-red-500">
                              -{currencySymbol}{t.amount.toFixed(2)}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(t);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog onOpenChange={(open) => { if(!open) setTransactionToDelete(null)}}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setTransactionToDelete(t.id);
                                        }}
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
                                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={(e) => { e.stopPropagation(); handleDelete();}}>
                                        Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                               </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                          <p>No expenses found for this day.</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
               <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                    <p>No expenses found for the selected period.</p>
                </div>
            )}
          </Accordion>
          )}
        </CardContent>
      </Card>
      
      <Sheet open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <SheetContent>
            {selectedTransaction && (
                <>
                <SheetHeader>
                    <SheetTitle>{selectedTransaction.title}</SheetTitle>
                    <SheetDescription>Expense Details</SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-4">
                    <div className="text-4xl font-bold text-destructive text-center">
                        -{currencySymbol}{selectedTransaction.amount.toFixed(2)}
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                        <div className="flex items-center gap-3">
                            <CategoryIcon category={selectedTransaction.category} className="h-5 w-5"/>
                            <Badge variant="outline">{selectedTransaction.category}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground"/>
                            <span className="text-sm">{format(parseISO(selectedTransaction.date), "PPP")}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-muted-foreground"/>
                            <span className="text-sm">{format(parseISO(selectedTransaction.date), "p")}</span>
                        </div>
                        {selectedTransaction.description && (
                            <p className="text-sm text-muted-foreground pt-2 border-t border-border">
                                {selectedTransaction.description}
                            </p>
                        )}
                    </div>
                </div>
                 <SheetFooter className="flex-col sm:flex-col sm:justify-start sm:items-start gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleEdit(selectedTransaction)}
                        className="w-full"
                    >
                        <Edit className="mr-2 h-4 w-4" /> Edit Transaction
                    </Button>
                     <AlertDialog onOpenChange={(open) => { if(!open) setTransactionToDelete(null)}}>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => setTransactionToDelete(selectedTransaction.id)}
                            >
                                <Trash className="mr-2 h-4 w-4" /> Delete Transaction
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
                                <AlertDialogAction onClick={() => {handleDelete();}}>
                                Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </SheetFooter>
                </>
            )}
        </SheetContent>
      </Sheet>
    </>
  );
}
