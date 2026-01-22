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
    PieChart,
    History,
    Gamepad2,
    User,
    Settings,
    ScrollText,
    Eye,
    EyeOff
} from "lucide-react";
import Image from "next/image";
import { usePrivacy } from "@/hooks/use-privacy";

interface SidebarProps {
    onLinkClick?: () => void;
}

export default function Sidebar({ onLinkClick }: SidebarProps) {
    const pathname = usePathname();
    const { isPrivacyMode, togglePrivacy } = usePrivacy();

    const links = [
        { href: "/dashboard", label: "Home", icon: LayoutDashboard },
        { href: "/budgets", label: "Budgets", icon: Wallet },
        { href: "/expenses", label: "Expenses", icon: Receipt },
        { href: "/income", label: "Income", icon: TrendingUp },
        { href: "/todo", label: "To-Do List", icon: CheckSquare },
        { href: "/reports", label: "Reports", icon: PieChart },
        { href: "/previous-history", label: "Previous History", icon: History },
        { href: "/game", label: "Game", icon: Gamepad2 },
        { href: "/budget-history", label: "Budget History", icon: ScrollText },
        { href: "/profile", label: "Profile", icon: User },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="flex flex-col h-full bg-card border-r w-72">

            {/* --- LOGO SECTION --- */}
            <div className="p-6 pb-2 flex items-center gap-3">
                <div className="relative h-9 w-9">
                    <Image
                        src="/logo-dark.png"
                        alt="Logo"
                        fill
                        sizes="36px"
                        className="object-contain dark:hidden"
                        priority
                    />
                    <Image
                        src="/logo-light.png"
                        alt="Logo"
                        fill
                        sizes="36px"
                        className="object-contain hidden dark:block"
                        priority
                    />
                </div>
                <span className="font-bold text-2xl text-foreground">
                    Spend<span className="text-primary">Control</span>
                </span>
            </div>

            {/* Navigation Links - Added mt-4 to push the list down from the logo */}
            <nav className="flex-1 px-4 py-4 mt-4 space-y-2 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onLinkClick}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer User Card */}
            <div className="p-4 border-t mt-auto">
                <div className="flex items-center gap-3 px-2 py-2 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        N
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">My Account</p>
                        <p className="text-xs text-muted-foreground truncate">Free Plan</p>
                    </div>
                    <button
                        onClick={togglePrivacy}
                        className="p-2 rounded-lg hover:bg-zinc-800 text-muted-foreground hover:text-white transition-colors"
                        title={isPrivacyMode ? "Show Balances" : "Hide Balances"}
                    >
                        {isPrivacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}