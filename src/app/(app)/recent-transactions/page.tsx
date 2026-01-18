"use client";

import RecentTransactions from "@/components/dashboard/recent-transactions";
import { useTransactions } from "@/hooks/use-transactions";

export default function RecentTransactionsPage() {
    const { transactions } = useTransactions();

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-24">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Recent Transactions</h2>
                <p className="text-muted-foreground">
                    A list of your latest income and expenses.
                </p>
            </div>

            {/* Reusing your existing component here */}
            <RecentTransactions transactions={transactions} />
        </div>
    );
}
