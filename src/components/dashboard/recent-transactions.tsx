"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import type { Transaction } from "@/lib/types";
import { useCurrency } from "@/hooks/use-currency";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

type RecentTransactionsProps = {
    transactions: Transaction[];
};

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
    const { currencySymbol } = useCurrency();

    // Sort by date (newest first) and take top 5
    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    return (
        <Card className="shadow-md shadow-primary/10 h-full">
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentTransactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No transactions yet.</p>
                    ) : (
                        recentTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-3 border rounded-lg bg-card/50 hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Icon Box */}
                                    <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {transaction.type === 'income' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-1">
                                        {/* This displays the 'Description' you typed */}
                                        <p className="text-sm font-medium leading-none">{transaction.title || "No description"}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-muted-foreground">{format(new Date(transaction.date), "MMM d")}</p>
                                            <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded-full bg-secondary border">
                                                {transaction.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className={`font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-foreground'}`}>
                                    {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{transaction.amount.toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
