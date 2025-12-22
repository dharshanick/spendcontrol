"use client";

import { useState } from "react";
import AddExpenseModal from "@/components/shared/add-expense-modal";
import AddIncomeModal from "@/components/shared/add-income-modal";
import MobileNav from "@/components/layout/mobile-nav";
import MobileHeader from "@/components/layout/mobile-header"; 
// ✅ FIX: Import from 'sidebar-nav', not 'sidebar'
import SidebarNav from "@/components/layout/sidebar-nav"; 

// Providers
import { TransactionsProvider } from "@/hooks/use-transactions";
import { BudgetsProvider } from "@/hooks/use-budgets";
import { TodosProvider } from "@/hooks/use-todos";
import { UserProvider } from "@/hooks/use-user";
import { ReminderProvider } from "@/hooks/use-reminder";
import { CurrencyProvider } from "@/hooks/use-currency";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      <UserProvider>
        <TransactionsProvider>
          <BudgetsProvider>
            <TodosProvider>
              <ReminderProvider>
                
                {/* GLOBAL MODALS */}
                <AddExpenseModal />
                <AddIncomeModal />

                <div className="flex h-screen bg-background text-foreground">
                  
                  {/* 1. DESKTOP SIDEBAR */}
                  <div className="hidden md:block w-64 border-r h-full fixed left-0 top-0 z-10 bg-card">
                    {/* ✅ FIX: Use SidebarNav here */}
                    <SidebarNav />
                  </div>

                  {/* 2. MAIN CONTENT AREA */}
                  <div className="flex-1 flex flex-col h-full md:pl-64 transition-all duration-300">
                    
                    {/* NEW: Mobile Header */}
                    <MobileHeader />

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24">
                      {children}
                    </main>

                    {/* Mobile Nav (Bottom Bar) */}
                    <div className="md:hidden sticky bottom-0 z-50 bg-background border-t">
                        <MobileNav /> 
                    </div>
                  
                  </div>
                </div>

              </ReminderProvider>
            </TodosProvider>
          </BudgetsProvider>
        </TransactionsProvider>
      </UserProvider>
    </CurrencyProvider>
  );
}