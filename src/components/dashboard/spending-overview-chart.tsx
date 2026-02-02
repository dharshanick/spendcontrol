"use client";

import { useState, useMemo, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";
import { useTransactions } from "@/hooks/use-transactions";
import {
    startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay,
    startOfMonth, endOfMonth, startOfYear, endOfYear, eachMonthOfInterval
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
        // ALGORITHM: Always anchor to the current reference date (Today)
        const today = referenceDate || new Date();
        let data = [];

        if (timeRange === "Weekly") {
            // 1. WEEKLY LOGIC: Monday to Sunday of the CURRENT week
            // Automatically resets when the new week begins
            const start = startOfWeek(today, { weekStartsOn: 1 });
            const end = endOfWeek(today, { weekStartsOn: 1 });
            const days = eachDayOfInterval({ start, end });

            data = days.map(day => {
                const amount = transactions
                    .filter(t => t.type === 'expense' && isSameDay(new Date(t.date), day))
                    .reduce((sum, t) => sum + t.amount, 0);

                return {
                    day: format(day, "EEE"), // Mon, Tue...
                    fullDate: format(day, "yyyy-MM-dd"),
                    amount
                };
            });
        } else if (timeRange === "Monthly") {
            // 2. MONTHLY LOGIC: 1st to Last day of CURRENT Month
            // Automatically resets on the 1st of next month
            const start = startOfMonth(today);
            const end = endOfMonth(today);
            const days = eachDayOfInterval({ start, end });

            data = days.map(day => {
                const amount = transactions
                    .filter(t => t.type === 'expense' && isSameDay(new Date(t.date), day))
                    .reduce((sum, t) => sum + t.amount, 0);
                return {
                    day: format(day, "d"), // 1, 2, 3...
                    amount
                };
            });
        } else {
            // 3. YEARLY LOGIC: Jan 1 to Dec 31 of CURRENT Year
            const start = startOfYear(today);
            const end = endOfYear(today);
            const months = eachMonthOfInterval({ start, end });

            data = months.map(month => {
                const amount = transactions
                    .filter(t =>
                        t.type === 'expense' &&
                        new Date(t.date).getMonth() === month.getMonth() &&
                        new Date(t.date).getFullYear() === month.getFullYear()
                    )
                    .reduce((sum, t) => sum + t.amount, 0);
                return {
                    day: format(month, "MMM"), // Jan, Feb...
                    amount
                };
            });
        }

        return data;
    }, [transactions, timeRange, referenceDate]);

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
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                interval={timeRange === "Monthly" ? 4 : 0}
                                padding={{ left: 20, right: 20 }}
                                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${currencySymbol}${value}`}
                                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                                width={35}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.65rem] uppercase text-muted-foreground">
                                                            {payload[0].payload.day}
                                                        </span>
                                                        <span className="font-bold text-sm text-foreground">
                                                            {currencySymbol}{payload[0].value}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorAmount)"
                                activeDot={{ r: 5, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                                dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}