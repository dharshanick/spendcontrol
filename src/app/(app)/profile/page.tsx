"use client";

import { useUser } from "@/hooks/use-user";
import { useTransactions } from "@/hooks/use-transactions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Wallet, TrendingUp, Star, Trophy, Gamepad2, Medal, Camera, Upload } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { useMemo, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user, updateUser } = useUser() as any; 
  const { transactions } = useTransactions();
  const { currencySymbol } = useCurrency();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Calculate Real Financial Stats
  const financialStats = useMemo(() => {
    const income = transactions.filter((t: any) => t.type === "income").reduce((acc: number, t: any) => acc + t.amount, 0);
    const expense = transactions.filter((t: any) => t.type === "expense").reduce((acc: number, t: any) => acc + t.amount, 0);
    const totalTransactions = transactions.length;
    return {
        netWorth: income - expense,
        totalTransactions
    };
  }, [transactions]);

  // 2. Define Badges logic
  const gameScore = user?.highestGameScore || 0;
  
  const badges = [
    {
        id: "early-adopter",
        name: "Early Adopter",
        description: "Joined SpendControl",
        icon: <Star className="h-5 w-5 text-yellow-500" />,
        unlocked: true, 
    },
    {
        id: "saver",
        name: "Wealth Builder",
        description: "Net Worth > 10k",
        icon: <TrendingUp className="h-5 w-5 text-green-500" />,
        unlocked: financialStats.netWorth > 10000,
    },
    {
        id: "gamer-1",
        name: "Casual Gamer",
        description: "Score 10+ in Snake",
        icon: <Gamepad2 className="h-5 w-5 text-blue-500" />,
        unlocked: gameScore >= 10,
    },
    {
        id: "gamer-pro",
        name: "Snake Champion",
        description: "Score 60+ in Snake",
        icon: <Crown className="h-5 w-5 text-purple-500" />,
        unlocked: gameScore >= 60,
    }
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;

  // 3. IMAGE UPLOAD LOGIC
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Limit size to 1MB to prevent LocalStorage crash
    if (file.size > 1024 * 1024) {
        alert("Image is too large! Please choose an image under 1MB.");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = reader.result as string;
        // Save to user object
        if(updateUser) {
            updateUser({ avatar: base64String });
        }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* 1. HEADER CARD */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-none shadow-md">
        <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
                
                {/* AVATAR WITH UPLOAD BUTTON */}
                <div className="relative group">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                        {/* Use uploaded avatar OR fallback to DiceBear */}
                        <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "User"}`} className="object-cover" />
                        <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    
                    {/* Hidden File Input */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                    />
                    
                    {/* Camera Button Overlay */}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                        title="Change Profile Picture"
                    >
                        <Camera className="h-4 w-4" />
                    </button>
                </div>
                
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-3xl font-bold">{user?.name || "My Account"}</h1>
                    <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mt-1">
                        <Wallet className="h-4 w-4" /> Offline Profile
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                        <Badge variant="secondary" className="px-3 py-1">
                            Level {Math.floor(unlockedCount * 1.5) + 1}
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1 border-primary/50 text-primary">
                            {user?.currency || "INR"} User
                        </Badge>
                    </div>
                </div>

                <div className="bg-background/50 p-4 rounded-lg text-center min-w-[120px]">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Net Worth</div>
                    <div className={`text-2xl font-black mt-1 ${financialStats.netWorth >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {currencySymbol}{financialStats.netWorth.toLocaleString()}
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 2. STATS OVERVIEW */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" /> Account Stats
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Total Transactions</span>
                    <span className="font-bold">{financialStats.totalTransactions}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Highest Snake Score</span>
                    <span className="font-bold text-primary">{gameScore}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Badges Unlocked</span>
                    <span className="font-bold">{unlockedCount} / {badges.length}</span>
                </div>
                <Link href="/settings" className="block mt-4">
                    <Button variant="outline" className="w-full">Edit Profile Name</Button>
                </Link>
            </CardContent>
        </Card>

        {/* 3. TROPHY CABINET */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" /> Trophy Cabinet
                </CardTitle>
                <CardDescription>Achievements unlocked.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-3">
                    {badges.map((badge) => (
                        <div 
                            key={badge.id} 
                            className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                                badge.unlocked 
                                    ? "bg-accent/50 border-accent" 
                                    : "opacity-50 grayscale border-dashed"
                            }`}
                        >
                            <div className={`p-2 rounded-full ${badge.unlocked ? "bg-background shadow-sm" : "bg-muted"}`}>
                                {badge.icon}
                            </div>
                            <div>
                                <div className="font-semibold">{badge.name}</div>
                                <div className="text-xs text-muted-foreground">{badge.description}</div>
                            </div>
                            {badge.unlocked && (
                                <Medal className="h-4 w-4 text-primary ml-auto" />
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}