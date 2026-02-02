"use client";

import { useState, useMemo, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";
import { useTransactions } from "@/hooks/use-transactions";
import {
    startOfWeek, endOfWeek, eachDayOfInterval, format,
    startOfMonth, endOfMonth, startOfYear, endOfYear, eachMonthOfInterval,
    parseISO, isValid
} from "date-fns";

export default function SpendingOverviewChart({ referenceDate }: { referenceDate?: Date }) {
    const { currencySymbol } = useCurrency();
    const { transactions } = useTransactions();
    const [timeRange, setTimeRange] = useState("Weekly");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const chartData = useMemo(() => {
        const today = referenceDate || new Date();
        let days: Date[] = [];
        let dateFormat = "yyyy-MM-dd";
        let labelFormat = "EEE"; // Default (Mon, Tue)

        // 1. DETERMINE TIME RANGE & INTERVALS
        if (timeRange === "Weekly") {
            const start = startOfWeek(today, { weekStartsOn: 1 });
            const end = endOfWeek(today, { weekStartsOn: 1 });
            days = eachDayOfInterval({ start, end });
            labelFormat = "EEE"; // Mon
        } else if (timeRange === "Monthly") {
            const start = startOfMonth(today);
            const end = endOfMonth(today);
            days = eachDayOfInterval({ start, end });
            labelFormat = "d"; // 1, 2, 3
        } else {
            // Yearly
            const start = startOfYear(today);
            const end = endOfYear(today);
            days = eachMonthOfInterval({ start, end });
            dateFormat = "yyyy-MM"; // Group by Month
            labelFormat = "MMM"; // Jan, Feb
        }

        // 2. AGGREGATE DATA (The Fix for Missing Expenses)
        // Instead of filtering 100 times, we loop once to create a "Sum Map"
        const expensesMap: Record<string, number> = {};

        transactions.forEach((t) => {
            if (t.type !== "expense") return;

            // Safely parse date
            if (!t.date) return;
            const tDate = typeof t.date === 'string' ? parseISO(t.date) : t.date;
            if (!isValid(tDate)) return;

            // Generate key (e.g., "2026-01-30" or "2026-01" for yearly)
            const key = format(tDate, dateFormat);

            expensesMap[key] = (expensesMap[key] || 0) + t.amount;
        });

        // 3. MAP DAYS TO CHART DATA
        const data = days.map((day) => {
            const key = format(day, dateFormat);
            return {
                day: format(day, labelFormat),
                fullDate: key,
                amount: expensesMap[key] || 0, // Lookup sum or default to 0
            };
        });

        return data;

    }, [transactions, timeRange, referenceDate]);

    // Prevent hydration mismatch
    if (!isMounted) return <div className="col-span-4 h-[250px] w-full bg-muted/5 animate-pulse rounded-xl" />;

    return (
        <Card className="col-span-4 shadow-md shadow-primary/10 h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle>Spending Overview</CardTitle>
                    <div className="flex gap-2">
                        <Select defaultValue="Weekly" onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[100px] h-8 text-xs">
                                <SelectValue placeholder="Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Weekly">Weekly</SelectItem>
                                <SelectItem value="Monthly">Monthly</SelectItem>
                                <SelectItem value="Yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    View your spending trends over time.
                </p>
            </CardHeader>
            <CardContent className="pl-0 pb-2">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                                {/* Fixed Gradient Definition */}
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                interval={timeRange === "Monthly" ? 4 : 0} // Skip ticks on monthly view to prevent crowding
                                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${currencySymbol}${value}`}
                                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                                width={35}
                                domain={['auto', 'auto']} // FIX: Allows chart to scale dynamically
                            />
                            <Tooltip
                                cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "4 4" }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.65rem] uppercase text-muted-foreground">
                                                        {payload[0].payload.fullDate || payload[0].payload.day}
                                                    </span>
                                                    <span className="font-bold text-sm text-foreground">
                                                        {currencySymbol}{payload[0].value}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone" // Smooth curve
                                dataKey="amount"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorAmount)"
                                activeDot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}