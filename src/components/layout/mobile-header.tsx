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
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-6 left-6 z-50 h-12 w-12 bg-background/50 backdrop-blur-md border border-zinc-800 rounded-full shadow-lg"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="p-0 w-72">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Sidebar onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Header bar kept for Logo if needed, or can be removed if cleaner look desired. 
          Assuming User wants just the floaty button for menu, but might still expect a header bar for logo? 
          The request specifically asked to move the button. 
          The original Header had the logo too. 
          I will keep the Header visual but REMOVE the menu button from inside it, 
          since the menu button is now FIXED positioning and floating. 
      */}

      <header className="flex items-center justify-end p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden sticky top-0 z-40 pl-20">
        {/* DYNAMIC LOGO SECTION */}
        <div className="flex items-center gap-3 mr-auto">
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
      </header>
    </>
  );
}
