
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, Plus, IndianRupee, ListChecks, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTransactions } from '@/hooks/use-transactions';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/todos', label: 'To-Do', icon: ListChecks },
  { href: '/budgets', label: 'Budgets', icon: Target },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { setAddExpenseModalOpen, setAddIncomeModalOpen } = useTransactions();
  const [isFabOpen, setIsFabOpen] = useState(false);

  return (
    <>
      <div className="sm:hidden fixed bottom-20 right-4 z-50">
        {isFabOpen && (
             <div 
                className="flex flex-col items-center gap-3 mb-3"
            >
                <div>
                    <button onClick={() => { setAddIncomeModalOpen(true); setIsFabOpen(false); }} className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg flex items-center gap-2">
                        <IndianRupee className="h-5 w-5" />
                    </button>
                </div>
                 <div>
                    <button onClick={() => { setAddExpenseModalOpen(true); setIsFabOpen(false); }} className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg flex items-center gap-2">
                        <Minus className="h-5 w-5" />
                    </button>
                </div>
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
      <div className="sm:hidden fixed bottom-0 left-0 z-40 w-full h-16 bg-card/80 backdrop-blur-sm border-t">
        <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex flex-col items-center justify-center px-5 hover:bg-accent/50 group",
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
