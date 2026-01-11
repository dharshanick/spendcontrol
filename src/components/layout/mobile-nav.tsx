"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTransactions } from '@/hooks/use-transactions';
import { useState } from 'react';
import { Plus, LayoutDashboard, Wallet, PieChart, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: Wallet },
  { href: '/reports', label: 'Reports', icon: PieChart },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { setAddExpenseModalOpen, setAddIncomeModalOpen } = useTransactions();
  const [isFabOpen, setIsFabOpen] = useState(false);

  return (
    <>
      {/* FAB Button - Raised it higher (bottom-24) so it doesn't overlap */}
      <div className="sm:hidden fixed bottom-24 right-4 z-50">
        {isFabOpen && (
          <div className="flex flex-col items-center gap-3 mb-3">
            {/* FIXED: Removed 'variant' and 'size' props causing the error */}
            <Button
              className="h-12 w-12 rounded-full border-2 border-green-500 bg-background text-green-500 shadow-lg hover:bg-green-50 hover:text-green-600 p-0 flex items-center justify-center"
              onClick={() => {
                setAddIncomeModalOpen(true);
                setIsFabOpen(false);
              }}
            >
              <ArrowDownCircle className="h-6 w-6" />
              <span className="sr-only">Add Income</span>
            </Button>

            {/* FIXED: Removed 'variant' and 'size' props causing the error */}
            <Button
              className="h-12 w-12 rounded-full border-2 border-red-500 bg-background text-red-500 shadow-lg hover:bg-red-50 hover:text-red-600 p-0 flex items-center justify-center"
              onClick={() => {
                setAddExpenseModalOpen(true);
                setIsFabOpen(false);
              }}
            >
              <ArrowUpCircle className="h-6 w-6" />
              <span className="sr-only">Add Expense</span>
            </Button>
          </div>
        )}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="bg-primary text-primary-foreground rounded-full p-4 shadow-lg shadow-primary/40 transition-transform"
          style={{ transform: isFabOpen ? 'rotate(45deg) scale(1.1)' : 'rotate(0) scale(1)' }}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* CHANGE 3: Added 'pb-6' and removed fixed 'h-16' */}
      <div className="sm:hidden fixed bottom-0 left-0 z-40 w-full bg-card/80 backdrop-blur-sm border-t pb-6 pt-2">
        <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex flex-col items-center justify-center px-5 py-2 hover:bg-accent/50 group",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
