"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Settings,
  Target,
  IndianRupee,
  ListChecks,
  AreaChart,
  User,
  Archive,
  Gamepad2,
  WalletCards,
} from "lucide-react";

import Logo from "../shared/logo";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/types";
import { useUser } from "@/hooks/use-user";

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/expenses", label: "Expenses", icon: WalletCards },
  { href: "/income", label: "Income", icon: IndianRupee },
  { href: "/todos", label: "To-Do List", icon: ListChecks },
  { href: "/reports", label: "Reports", icon: AreaChart },
  { href: "/previous-history", label: "Previous History", icon: Archive },
  { href: "/game", label: "Game", icon: Gamepad2 },
];

const bottomNavItems: NavItem[] = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
]

// ✅ FIX: Define the props type
type SidebarNavProps = {
  className?: string;
};

// ✅ FIX: Accept { className } as a prop
export default function SidebarNav({ className }: SidebarNavProps) {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    // ✅ FIX: Merge the passed 'className' with the default styles using cn()
    <div className={cn("flex h-full flex-col p-4", className)}>
      <div className="mb-6">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>
      <nav className="flex flex-col gap-2 flex-grow">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/expenses' && pathname.startsWith('/expenses'));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-accent-foreground hover:bg-sidebar-accent",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
       <nav className="flex flex-col gap-2 pt-4 border-t border-sidebar-border">
        {bottomNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-accent-foreground hover:bg-sidebar-accent",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}