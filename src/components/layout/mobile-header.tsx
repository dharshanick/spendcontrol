"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import Sidebar from "@/components/layout/sidebar";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);

  // ---------------------------------------------------------
  // 2. ADD THIS "SWIPE TO OPEN" LOGIC
  // ---------------------------------------------------------
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const diffX = endX - startX;
      const diffY = Math.abs(endY - startY);

      // LOGIC:
      // 1. Swipe must be Left-to-Right (diffX > 50)
      // 2. Must start near the left edge (startX < 40) - Like a native drawer
      // 3. Must not be scrolling up/down (diffY < 50)
      if (diffX > 50 && startX < 40 && diffY < 50) {
        setOpen(true);
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);
  // ---------------------------------------------------------

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-14 left-4 z-50 h-10 w-10 text-zinc-400 hover:text-white"
          >
            <Menu className="h-8 w-8" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="p-0 w-72">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Sidebar onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
