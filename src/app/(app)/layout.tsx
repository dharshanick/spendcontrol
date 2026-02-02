"use client";

import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

// Providers
import { TransactionsProvider } from "@/hooks/use-transactions";
import { TodosProvider } from "@/hooks/use-todos";
import { UserProvider } from "@/hooks/use-user";
import { ReminderProvider } from "@/hooks/use-reminder";
import { CurrencyProvider } from "@/hooks/use-currency";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <CurrencyProvider>
      <UserProvider>
        <TransactionsProvider>
          <TodosProvider>
            <ReminderProvider>

              {/* FIX: 'fixed inset-0' locks this wrapper to the screen edges. 
                  It cannot move or bounce. 
              */}
              <div className="fixed inset-0 flex h-full w-full bg-background overflow-hidden">

                {/* Desktop Sidebar */}
                <div className="hidden md:flex h-full w-72 flex-col border-r z-50">
                  <Sidebar />
                </div>

                {/* Main Wrapper */}
                <div className="flex-1 flex flex-col h-full w-full relative">

                  {/* Floating Mobile Menu Button */}
                  <div className="md:hidden absolute top-4 left-4 z-[60]">
                    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-zinc-700 dark:text-zinc-200 hover:bg-white/20 h-10 w-10 backdrop-blur-sm rounded-full">
                          <Menu className="h-6 w-6" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="p-0 border-r border-zinc-800 w-72 bg-card">
                        <Sidebar onLinkClick={() => setIsSidebarOpen(false)} />
                      </SheetContent>
                    </Sheet>
                  </div>

                  {/* SCROLL AREA: 
                     This is the ONLY place that scrolls.
                     'flex-1' fills the space.
                     'overflow-y-auto' enables internal scrolling.
                     '-webkit-overflow-scrolling: touch' makes it smooth on iPhone.
                  */}
                  <main className="flex-1 overflow-y-auto overflow-x-hidden p-0 bg-background w-full h-full overscroll-contain">
                    {children}
                  </main>

                  {/* Mobile Bottom Nav */}
                  <MobileNav />
                </div>
              </div>

            </ReminderProvider>
          </TodosProvider>
        </TransactionsProvider>
      </UserProvider>
    </CurrencyProvider>
  );
}