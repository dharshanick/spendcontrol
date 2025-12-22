
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { LogOut, PlusCircle, Settings, User, Star, User as UserIcon } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import Logo from "../shared/logo";
import { useTransactions } from "@/hooks/use-transactions";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";

const ThreeStarBadge = () => (
    <div className="absolute top-0 right-0 bg-yellow-400 p-1 rounded-full shadow-lg transform translate-x-1/4 -translate-y-1/4">
        <div className="flex gap-px">
            <Star className="h-2 w-2 text-white fill-white" />
        </div>
    </div>
);


export default function Header() {
  const { user, resetUser } = useUser();
  const { setAddExpenseModalOpen, setAddIncomeModalOpen } = useTransactions();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    resetUser();
    router.push("/login");
  };


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="hidden md:block">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>

      <div className="flex w-full items-center justify-end gap-2">
        <Button variant="outline" className="hidden sm:flex" onClick={() => setAddIncomeModalOpen(true)}>
            <PlusCircle className="mr-2" />
            Add Income
        </Button>
        <Button className="hidden sm:flex" onClick={() => setAddExpenseModalOpen(true)}>
            <PlusCircle className="mr-2" />
            Add Expense
        </Button>

        {mounted && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="User profile avatar"
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                   <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                )}
                 {(user.highestGameScore || 0) >= 60 && <ThreeStarBadge />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile">
                <DropdownMenuItem>
                  <User className="mr-2" />
                  Profile
                </DropdownMenuItem>
              </Link>
              <Link href="/settings">
                <DropdownMenuItem>
                  <Settings className="mr-2" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

    
