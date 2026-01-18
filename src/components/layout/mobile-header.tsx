"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import Sidebar from "@/components/layout/sidebar";
import { useState } from "react";
import Image from "next/image";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden sticky top-0 z-50">

      {/* Menu Trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="p-0 w-72">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Sidebar onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* DYNAMIC LOGO SECTION - SWAPPED FIX */}
      <div className="flex items-center gap-3">
        <div className="relative h-9 w-9">
          {/* 1. LIGHT MODE: Shows the Dark Logo (for contrast) */}
          <Image
            src="/logo-dark.png"
            alt="Logo"
            fill
            sizes="36px"
            className="object-contain dark:hidden"
            priority
          />
          {/* 2. DARK MODE: Shows the Light/Neon Logo (for contrast) */}
          <Image
            src="/logo-light.png"
            alt="Logo"
            fill
            sizes="36px"
            className="object-contain hidden dark:block"
            priority
          />
        </div>

        <span className="font-bold text-xl tracking-tight text-foreground">
          Spend<span className="text-primary">Control</span>
        </span>
      </div>

      <div className="w-9" />
    </header>
  );
}
