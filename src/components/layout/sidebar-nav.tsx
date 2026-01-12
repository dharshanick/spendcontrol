"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  TrendingUp,
  CheckSquare,
  BarChart3,
  History,
  Gamepad2,
  User,
  Settings
} from "lucide-react";

export default function SidebarNav() {
  const pathname = usePathname();

  // 1. Main Navigation
  const mainNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/budgets", icon: Wallet, label: "Budgets" },
    { href: "/expenses", icon: Receipt, label: "Expenses" },
    { href: "/income", icon: TrendingUp, label: "Income" },
    { href: "/todos", icon: CheckSquare, label: "To-Do List" },
    { href: "/reports", icon: BarChart3, label: "Reports" },
    { href: "/previous-history", icon: History, label: "Previous History" },
    { href: "/game", icon: Gamepad2, label: "Game" },
  ];

  // 2. Secondary Navigation (Profile & Settings)
  const secondaryNavItems = [
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="flex flex-col h-full py-6 px-4">
      {/* APP LOGO */}
      <div className="mb-8 px-2 flex items-center gap-2">
        {/* You can put your Logo Image or Text here */}
        <span className="text-xl font-bold text-primary">SpendControl</span>
      </div>

      {/* TOP LINKS (Main) */}
      <div className="space-y-1">
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>

      {/* ✅ FIX: Removed 'mt-auto' so there is no huge gap.
         Added 'mt-4 pt-4 border-t' to create a small separator line immediately after Game.
      */}
      <div className="space-y-1 mt-4 pt-4 border-t border-border/50">
        {secondaryNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}