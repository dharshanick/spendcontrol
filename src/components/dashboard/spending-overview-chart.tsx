"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactions } from "@/hooks/use-transactions";
import { useMemo, useState, useEffect } from "react";
import { 
    eachDayOfInterval, 
    eachMonthOfInterval, 
    eachYearOfInterval, 
    endOfDay, 
    endOfMonth, 
    endOfYear, 
    format, 
    startOfDay, 
    startOfMonth, 
    startOfYear, 
    subYears, 
    isAfter, 
    isBefore,
    max,
    parseISO
} from "date-fns";
import { Skeleton } from "../ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useCurrency } from "@/hooks/use-currency";

const chartConfig = {
  expenses: {
    label: "Expenses",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

type SpendingOverviewChartProps = {
    referenceDate: Date;
    weekStartDate: Date;
    weekEndDate: Date;
}

export default function SpendingOverviewChart({ referenceDate, weekStartDate, weekEndDate }: SpendingOverviewChartProps) {
    const { transactions } = useTransactions();
    const { currencySymbol } = useCurrency();
    const [mounted, setMounted] = useState(false);
    const [yAxisRange, setYAxisRange] = useState('auto');
    const [customMin, setCustomMin] = useState('0');
    const [customMax, setCustomMax] = useState('100000');
    const [yAxisDomain, setYAxisDomain] = useState<[number | 'auto', number | 'auto']>(['auto', 'auto']);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (yAxisRange === 'custom') {
            const min = parseInt(customMin, 10);
            const max = parseInt(customMax, 10);
            if (!isNaN(min) && !isNaN(max) && min < max) {
                 setYAxisDomain([min, max]);
            }
        } else if (yAxisRange === 'auto') {
            setYAxisDomain(['auto', 'auto']);
        } else {
            const max = parseInt(yAxisRange, 10);
            if (!isNaN(max)) {
                setYAxisDomain([0, max]);
            }
        }
    }, [yAxisRange, customMin, customMax]);

    // 1. LOGIC: Find the very first transaction date
    const earliestTransactionDate = useMemo(() => {
        if (transactions.length === 0) return new Date();
        // Sort transactions by date ascending
        const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return parseISO(sorted[0].date);
    }, [transactions]);

    // 2. LOGIC: Smart Weekly Data
    // (If the user started midway through this week, technically we still usually show the full week 
    // for context, but we can clamp it if strictly needed. For now, full week is usually better UI).
    const weeklyData = useMemo(() => {
        const start = weekStartDate;
        const end = weekEndDate;
        const days = eachDayOfInterval({ start, end });

        return days.map(day => {
        const dayExpenses = transactions
            .filter(t => t.type === 'expense' && new Date(t.date) >= startOfDay(day) && new Date(t.date) <= endOfDay(day))
            .reduce((acc, t) => acc + t.amount, 0);
        return { day: format(day, 'E'), expenses: dayExpenses };
        });
    }, [transactions, weekStartDate, weekEndDate]);

    // 3. LOGIC: Smart Monthly Data (The biggest fix)
    const monthlyData = useMemo(() => {
        // Standard Year Start (Jan 1st)
        let start = startOfYear(referenceDate);
        const end = endOfYear(referenceDate);

        // CHECK: If the "Earliest Transaction" is AFTER Jan 1st of this year,
        // start the graph from that month instead.
        // Example: Ref is 2025. Start Date is Aug 2025. Graph starts in Aug.
        if (isAfter(startOfMonth(earliestTransactionDate), start)) {
            // Only apply this logic if we are looking at the *same year* the user started
            // (e.g. Don't clip 2026 just because they started in Aug 2025)
            if (earliestTransactionDate.getFullYear() === referenceDate.getFullYear()) {
                start = startOfMonth(earliestTransactionDate);
            }
        }

        // Safety: Ensure start is not after end
        if (isAfter(start, end)) {
            start = startOfYear(referenceDate);
        }

        const months = eachMonthOfInterval({ start, end });

        return months.map(month => {
            const monthExpenses = transactions
                .filter(t => t.type === 'expense' && new Date(t.date) >= startOfMonth(month) && new Date(t.date) <= endOfMonth(month))
                .reduce((acc, t) => acc + t.amount, 0);
            return { month: format(month, 'MMM'), expenses: monthExpenses };
        });
    }, [transactions, referenceDate, earliestTransactionDate]);

    // 4. LOGIC: Smart Yearly Data
    const yearlyData = useMemo(() => {
        // Standard: Last 3 years
        let start = subYears(referenceDate, 3);
        const end = referenceDate;

        // CHECK: If the user started *after* 3 years ago, clamp the start date.
        // Example: Joined in 2024. Don't show 2022 or 2023.
        if (isAfter(startOfYear(earliestTransactionDate), start)) {
            start = startOfYear(earliestTransactionDate);
        }
        
        // Safety check
        if (isAfter(start, end)) {
             start = subYears(referenceDate, 0); // Show at least current year
        }

        const years = eachYearOfInterval({ start, end });

        return years.map(year => {
            const yearExpenses = transactions
                .filter(t => t.type === 'expense' && new Date(t.date) >= startOfYear(year) && new Date(t.date) <= endOfYear(year))
                .reduce((acc, t) => acc + t.amount, 0);
            return { year: format(year, 'yyyy'), expenses: yearExpenses };
        });
    }, [transactions, referenceDate, earliestTransactionDate]);

  if (!mounted) {
      return (
          <Card className="shadow-md shadow-primary/10">
              <CardHeader>
                  <CardTitle>Spending Overview</CardTitle>
                  <CardDescription>View your spending trends over time.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Skeleton className="h-[300px] w-full" />
              </CardContent>
          </Card>
      )
  }

  const formatYAxis = (tick: number) => {
    if (tick >= 100000) return `${currencySymbol}${(tick / 100000).toFixed(1)}L`;
    if (tick >= 1000) return `${currencySymbol}${(tick / 1000).toFixed(0)}k`;
    return `${currencySymbol}${tick}`;
  }

  return (
    <Card className="shadow-md shadow-primary/10 flex flex-col">
      <CardHeader>
        <CardTitle>Spending Overview</CardTitle>
        <CardDescription>View your spending trends over time.</CardDescription>
         <div className="flex gap-4 items-end pt-4">
            <div className="flex-1">
                <Label className="text-xs">Amount Range</Label>
                <Select value={yAxisRange} onValueChange={setYAxisRange}>
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="10000">0 - 10,000</SelectItem>
                        <SelectItem value="20000">0 - 20,000</SelectItem>
                        <SelectItem value="50000">0 - 50,000</SelectItem>
                        <SelectItem value="100000">0 - 1,00,000</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {yAxisRange === 'custom' && (
                <div className="flex-1 flex items-end gap-2">
                    <div>
                        <Label htmlFor="customMin" className="text-xs">Min</Label>
                        <Input id="customMin" type="number" value={customMin} onChange={e => setCustomMin(e.target.value)} placeholder="Min" className="h-9"/>
                    </div>
                    <div>
                        <Label htmlFor="customMax" className="text-xs">Max</Label>
                        <Input id="customMax" type="number" value={customMax} onChange={e => setCustomMax(e.target.value)} placeholder="Max" className="h-9"/>
                    </div>
                </div>
            )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <Tabs defaultValue="weekly">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart data={weeklyData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={formatYAxis} domain={yAxisDomain} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="expenses" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r: 4, fill: "hsl(var(--primary))"}} activeDot={{r: 8, style: {filter: `drop-shadow(0 0 5px hsl(var(--primary)))`}}} />
            </LineChart>
            </ChartContainer>
        </TabsContent>
        <TabsContent value="monthly">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart data={monthlyData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={formatYAxis} domain={yAxisDomain} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="expenses" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r: 4, fill: "hsl(var(--primary))"}} activeDot={{r: 8, style: {filter: `drop-shadow(0 0 5px hsl(var(--primary)))`}}}/>
            </LineChart>
            </ChartContainer>
        </TabsContent>
        <TabsContent value="yearly">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart data={yearlyData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={formatYAxis} domain={yAxisDomain} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="expenses" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r: 4, fill: "hsl(var(--primary))"}} activeDot={{r: 8, style: {filter: `drop-shadow(0 0 5px hsl(var(--primary)))`}}}/>
            </LineChart>
            </ChartContainer>
        </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}