
"use client";

import React, { useState, useMemo } from "react";
import { format, isValid, isSameDay, parseISO } from "date-fns";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import CategoryIcon from "../shared/category-icon";
import { ScrollArea } from "../ui/scroll-area";
import { useCurrency } from "@/hooks/use-currency";


export default function CalendarView({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const { currencySymbol } = useCurrency();

  const transactionsByDate = useMemo(() => {
    const map = new Map<string, { total: number; transactions: Transaction[] }>();
    transactions.forEach((t) => {
      if (t.type === 'expense') {
        const date = parseISO(t.date).toDateString();
        if (!map.has(date)) {
          map.set(date, { total: 0, transactions: [] });
        }
        const dayData = map.get(date)!;
        dayData.total += t.amount;
        dayData.transactions.push(t);
      }
    });
    return map;
  }, [transactions]);

  const modifiers = useMemo(() => {
    const low: Date[] = [];
    const medium: Date[] = [];
    const high: Date[] = [];
    const footer: Record<string, React.ReactNode> = {};
    
    transactionsByDate.forEach((data, dateString) => {
      const date = new Date(dateString);
      if (data.total > 0) {
        footer[date.toDateString()] = (
           <p className="text-[10px] text-muted-foreground mt-1">
            {currencySymbol}{data.total.toFixed(0)}
          </p>
        );
      }

      if (data.total > 0 && data.total < 100) low.push(date);
      else if (data.total >= 100 && data.total < 500) medium.push(date);
      else if (data.total >= 500) high.push(date);
    });

    return { low, medium, high, footer };
  }, [transactionsByDate, currencySymbol]);

  const handleDayClick = (date: Date) => {
     if (date && isValid(date)) {
      setSelectedDay(date);
    }
  };
  
  const selectedDayTransactions = selectedDay ? transactionsByDate.get(selectedDay.toDateString())?.transactions || [] : [];
  const selectedDayTotal = selectedDay ? transactionsByDate.get(selectedDay.toDateString())?.total || 0 : 0;

  return (
    <>
      <DayPicker
        month={month}
        onMonthChange={setMonth}
        onDayClick={handleDayClick}
        showOutsideDays
        className="w-full"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4 w-full",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-lg font-medium",
          nav: "space-x-1 flex items-center",
          table: "w-full border-collapse space-y-1 mt-4",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-full font-normal text-sm",
          row: "flex w-full mt-2",
          cell: cn(
            "text-center text-sm p-0 relative focus-within:relative focus-within:z-20 w-full h-20",
            "has-[[aria-selected]]:bg-accent first:has-[[aria-selected]]:rounded-l-md last:has-[[aria-selected]]:rounded-r-md"
          ),
          day: "w-full h-full p-1 font-normal rounded-md flex flex-col items-center justify-center hover:bg-accent/50 cursor-pointer",
          day_today: "bg-primary/10 text-primary",
          day_selected: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
        }}
        modifiers={modifiers}
        modifiersClassNames={{
          low: 'low-spending',
          medium: 'medium-spending',
          high: 'high-spending'
        }}
        components={{
          DayContent: (props) => {
            const footerNode = modifiers.footer[props.date.toDateString()];
            return (
              <>
                <div>{format(props.date, "d")}</div>
                {footerNode || null}
              </>
            );
          },
        }}
      />
      <Sheet open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              Transactions for {selectedDay && format(selectedDay, "PPP")}
            </SheetTitle>
            <SheetDescription>
                Total Spent: {currencySymbol}{selectedDayTotal.toFixed(2)}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <div className="space-y-4 pr-4">
            {selectedDayTransactions.length > 0 ? (
                selectedDayTransactions.map((t) => (
                    <div key={t.id} className="flex items-center gap-4">
                        <div className="bg-muted p-2 rounded-lg">
                            <CategoryIcon category={t.category} />
                        </div>
                        <div className="flex-1">
                        <p className="font-medium">{t.title}</p>
                        <p className="text-sm text-muted-foreground">{t.category}</p>
                        </div>
                        <div className="font-semibold text-red-500">
                        -{currencySymbol}{t.amount.toFixed(2)}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-muted-foreground text-center pt-10">No expenses recorded for this day.</p>
            )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
