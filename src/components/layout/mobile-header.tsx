"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"; 
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react"; 
import { usePathname } from "next/navigation";
import SidebarNav from "./sidebar-nav"; 

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    // Added 'relative' so we can center the text absolutely
    <div className="flex items-center p-4 border-b bg-card md:hidden sticky top-0 z-50 relative h-16">
      
      {/* 1. MENU BUTTON (Left) */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="-ml-2 z-10 relative">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="p-0 w-[280px]">
           <SheetHeader className="px-4 py-4 border-b text-left">
             <SheetTitle>Menu</SheetTitle>
             <SheetDescription className="sr-only">
               Mobile navigation menu
             </SheetDescription>
           </SheetHeader>
           
           <div className="h-full overflow-y-auto">
                <SidebarNav className="border-none shadow-none w-full" />
           </div>
        </SheetContent>
      </Sheet>

      {/* 2. LOGO (Absolutely Centered) */}
      <div className="absolute left-0 right-0 flex justify-center items-center pointer-events-none">
        <div className="flex items-center gap-2 font-bold text-xl text-primary pointer-events-auto">
            <span className="text-2xl">🏛️</span> SpendControl
        </div>
      </div>

    </div>
  );
}