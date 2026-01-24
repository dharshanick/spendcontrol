"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useTransactions } from "@/hooks/use-transactions";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { RefreshCcw, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SpendingOverviewProps {
    referenceDate: Date;
}

export default function SpendingOverviewChart({ referenceDate }: SpendingOverviewProps) {
    const { transactions } = useTransactions();
    const [refreshKey, setRefreshKey] = useState(0);
    const [isDeleted, setIsDeleted] = useState(false); // State to control visibility

    const chartData = useMemo(() => {
        // If 'isDeleted' is true, return empty data to clear lines/bars
        if (isDeleted) return [];

        const start = startOfMonth(referenceDate);
        const end = endOfMonth(referenceDate);
        const daysInMonth = eachDayOfInterval({ start, end });

        return daysInMonth.map((day) => {
            const dayTransactions = transactions.filter((t) =>
                isSameDay(parseISO(t.date), day)
            );

            const income = dayTransactions
                .filter((t) => t.type === "income")
                .reduce((sum, t) => sum + t.amount, 0);

            const expense = dayTransactions
                .filter((t) => t.type === "expense")
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                day: format(day, "d"),
                income,
                expense,
            };
        });
    }, [transactions, referenceDate, refreshKey, isDeleted]);

    const handleRefresh = () => {
        setIsDeleted(false); // Restore data
        setRefreshKey((prev) => prev + 1); // Trigger animation replay
    };

    const handleDelete = () => {
        setIsDeleted(true); // Clear data view
    };

    return (
        <Card className="col-span-2 shadow-sm border-zinc-200 dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-bold">Spending Overview</CardTitle>
                <div className="flex items-center gap-1">
                    {/* Refresh Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        onClick={handleRefresh}
                    >
                        <RefreshCcw className="h-4 w-4" />
                    </Button>

                    {/* 3-Dot Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500 cursor-pointer">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete View
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full mt-2">
                    {!isDeleted && chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barGap={0} key={refreshKey}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" opacity={0.5} />
                                <XAxis
                                    dataKey="day"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12, fill: "#71717a" }}
                                    minTickGap={10}
                                />
                                <YAxis hide fontSize={12} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} animationDuration={1500} />
                                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} animationDuration={1500} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        // Empty State when deleted
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                            <p className="text-sm">No data to display</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}