"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    ArrowUpRight,
    ArrowDownLeft,
    Loader2,
    Edit2,
    Trophy,
    Star,
    Lock,
    Medal,
    Target,
    Settings as SettingsIcon
} from "lucide-react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useUser } from "@/hooks/use-user";
import { useTransactions } from "@/hooks/use-transactions"; // IMPORTED LIVE DATA HOOK
import Link from "next/link";

export default function ProfilePage() {
    const { user, updateUser } = useUser();
    const { transactions } = useTransactions(); // GET LIVE TRANSACTIONS

    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");

    // Cropper State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- 1. CALCULATE LIVE FINANCIALS ---
    // This replaces the old localStorage logic. It auto-updates whenever you add income/expense.
    const { income, expense, balance, hasTransactions } = useMemo(() => {
        const totalIncome = transactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            income: totalIncome,
            expense: totalExpense,
            balance: totalIncome - totalExpense, // This matches your Dashboard Savings
            hasTransactions: transactions.length > 0
        };
    }, [transactions]);

    const handleSaveName = () => {
        if (!tempName.trim()) return;
        updateUser({ fullName: tempName });
        setIsEditingName(false);
        toast.success("Name updated successfully!");
    };

    const startEditing = (e: React.MouseEvent) => {
        e.stopPropagation();
        setTempName(user?.fullName || "User");
        setIsEditingName(true);
    }

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl);
            setIsCropperOpen(true);
        }
    };

    const readFile = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener("load", () => resolve(reader.result as string), false);
            reader.readAsDataURL(file);
        });
    };

    const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const saveCroppedImage = useCallback(async () => {
        try {
            if (!imageSrc || !croppedAreaPixels) return;
            const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
            updateUser({ avatar: croppedImageBase64 });
            setIsCropperOpen(false);
            setImageSrc(null);
            toast.success("Profile photo updated!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to crop image.");
        }
    }, [imageSrc, croppedAreaPixels, updateUser]);

    if (!user) return <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black text-black dark:text-white"><Loader2 className="animate-spin" /></div>;

    const badges = [
        { id: "game_master", label: "Star Player", description: "Score 60+ in Game", icon: Star, unlocked: (user.highestGameScore || 0) >= 60, color: "text-yellow-500", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/20" },
        { id: "saver", label: "Smart Saver", description: "Save ₹10,000+", icon: Target, unlocked: balance >= 10000, color: "text-blue-500", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
        { id: "starter", label: "Getting Started", description: "First Transaction", icon: Medal, unlocked: hasTransactions, color: "text-green-500", bgColor: "bg-green-500/10", borderColor: "border-green-500/20" }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-zinc-900 dark:text-white pb-32 pt-24 md:pt-8 transition-colors duration-300">

            {/* HEADER WITH SETTINGS LINK */}
            <div className="flex justify-end px-4 md:px-6 max-w-2xl mx-auto mb-2">
                <Link href="/settings">
                    <Button variant="ghost" size="icon" className="text-zinc-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white">
                        <SettingsIcon className="h-6 w-6" />
                    </Button>
                </Link>
            </div>

            <div className="px-4 md:px-6 space-y-6 md:space-y-10 w-full max-w-2xl mx-auto">

                {/* === CARD === */}
                <div className="relative w-full aspect-[1.586/1] rounded-2xl md:rounded-3xl overflow-hidden p-6 md:p-10 flex flex-col justify-between group shadow-xl md:shadow-2xl
             bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 dark:from-[#1a1a1a] dark:to-[#050505]
             border border-black/5 dark:border-white/10 transition-colors duration-300">

                    <div className="absolute inset-0 opacity-30 dark:opacity-15 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    <div className="absolute -right-24 -top-24 h-64 w-64 md:h-80 md:w-80 bg-white/40 dark:bg-white/5 blur-3xl rounded-full pointer-events-none"></div>

                    {/* TOP ROW */}
                    <div className="flex justify-between items-start z-10 w-full">
                        <div className="flex flex-col">
                            <span className="text-zinc-500 text-[10px] md:text-xs uppercase tracking-widest font-bold mb-1">Card Holder</span>
                            {!isEditingName ? (
                                <div onClick={startEditing} className="flex items-center gap-2 md:gap-3 cursor-pointer hover:opacity-70 transition group/name">
                                    <h2 className="text-lg md:text-3xl font-bold text-zinc-800 dark:text-white tracking-wide truncate max-w-[140px] md:max-w-[300px]">
                                        {user.fullName || "Guest User"}
                                    </h2>
                                    <Edit2 className="h-3 w-3 md:h-4 md:w-4 text-zinc-400 opacity-0 group-hover/name:opacity-100 transition" />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Input value={tempName} onChange={(e) => setTempName(e.target.value)} className="h-7 md:h-9 w-40 md:w-56 bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-black dark:text-white text-sm md:text-base shadow-sm" autoFocus />
                                    <Button size="sm" onClick={handleSaveName} className="h-7 md:h-9 px-3 md:px-4 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 text-xs md:text-sm">OK</Button>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                            <span className="hidden sm:block font-bold text-xs md:text-base tracking-wider text-zinc-700 dark:text-white">Spend Control</span>
                            <div className="relative h-10 w-10 md:h-16 md:w-16 rounded-full border-2 border-white/50 dark:border-white/20 overflow-hidden cursor-pointer hover:border-zinc-400 dark:hover:border-white transition shadow-lg" onClick={() => fileInputRef.current?.click()}>
                                {user.avatar ? (<img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />) : (<div className="h-full w-full bg-gray-300 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 font-bold text-sm md:text-xl"> {user.fullName?.charAt(0) || "U"} </div>)}
                                <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE: BALANCE (NOW LIVE!) */}
                    <div className="z-10 mt-2 md:mt-4">
                        <h3 className="text-zinc-500 text-[10px] md:text-sm font-medium uppercase tracking-wider mb-1 md:mb-2">Total Balance</h3>
                        <div className="text-4xl md:text-7xl font-bold text-zinc-900 dark:text-white tracking-tight break-words">
                            {user.currency === "USD" ? "$" : "₹"}{balance.toLocaleString()}
                        </div>
                    </div>

                    {/* BOTTOM: CARD NUMBER & LOGO */}
                    <div className="flex justify-between items-end z-10 mt-auto">
                        <div className="font-mono text-zinc-600 dark:text-zinc-400 text-sm md:text-xl tracking-[0.15em] md:tracking-[0.25em] opacity-80">**** **** 4710</div>
                        <div className="flex -space-x-2 md:-space-x-4 opacity-90">
                            <div className="h-6 w-6 md:h-10 md:w-10 rounded-full bg-red-500/80 blur-[0.5px]"></div>
                            <div className="h-6 w-6 md:h-10 md:w-10 rounded-full bg-yellow-500/80 blur-[0.5px]"></div>
                        </div>
                    </div>
                </div>

                {/* === STATS (NOW LIVE!) === */}
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 md:p-6 flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-zinc-900/80 transition shadow-sm">
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-green-500/10 flex items-center justify-center mb-2 md:mb-4 border border-green-500/20">
                            <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-500" />
                        </div>
                        <div>
                            <p className="text-zinc-500 text-[10px] md:text-xs uppercase tracking-wider mb-0.5 md:mb-1">Income</p>
                            <p className="text-zinc-900 dark:text-white font-bold text-lg md:text-2xl truncate">+ {user.currency === "USD" ? "$" : "₹"}{income.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 md:p-6 flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-zinc-900/80 transition shadow-sm">
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-orange-500/10 flex items-center justify-center mb-2 md:mb-4 border border-orange-500/20">
                            <ArrowDownLeft className="h-4 w-4 md:h-5 md:w-5 text-orange-600 dark:text-orange-500" />
                        </div>
                        <div>
                            <p className="text-zinc-500 text-[10px] md:text-xs uppercase tracking-wider mb-0.5 md:mb-1">Expense</p>
                            <p className="text-zinc-900 dark:text-white font-bold text-lg md:text-2xl truncate">- {user.currency === "USD" ? "$" : "₹"}{expense.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* === BADGES === */}
                <div>
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                        <Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                        <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white">Achievements</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                        {badges.map((badge) => (
                            <div key={badge.id} className={`relative p-3 md:p-4 rounded-xl border flex flex-col items-center text-center gap-2 md:gap-3 transition-all duration-300 
                    ${badge.unlocked
                                    ? `${badge.bgColor} ${badge.borderColor} opacity-100`
                                    : 'bg-gray-100 dark:bg-zinc-900/30 border-gray-200 dark:border-zinc-800 opacity-50 grayscale'
                                }
                `}>
                                <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center ${badge.unlocked ? 'bg-black/5 dark:bg-black/20' : 'bg-gray-200 dark:bg-zinc-800'}`}>
                                    {badge.unlocked ? <badge.icon className={`h-4 w-4 md:h-5 md:w-5 ${badge.color}`} /> : <Lock className="h-3 w-3 md:h-4 md:w-4 text-zinc-400" />}
                                </div>
                                <div>
                                    <p className={`font-bold text-xs md:text-sm ${badge.unlocked ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>{badge.label}</p>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 md:mt-1 uppercase tracking-wide">{badge.description}</p>
                                </div>
                                {badge.unlocked && <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CROPPER MODAL */}
            <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
                <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white sm:max-w-md w-[90%] rounded-xl">
                    <DialogHeader><DialogTitle>Adjust Profile Picture</DialogTitle></DialogHeader>
                    <div className="relative h-48 md:h-64 w-full bg-black mt-4 rounded-lg overflow-hidden">
                        {imageSrc && (<Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />)}
                    </div>
                    <div className="pt-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">Zoom</span>
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={(val: number[]) => setZoom(val[0])}
                                className="flex-1"
                            />
                        </div>
                        <DialogFooter className="flex-row gap-2 justify-end">
                            <Button variant="ghost" onClick={() => setIsCropperOpen(false)} className="text-zinc-600 dark:text-zinc-400 flex-1 sm:flex-none">Cancel</Button>
                            <Button onClick={saveCroppedImage} className="bg-black dark:bg-white text-white dark:text-black hover:opacity-90 flex-1 sm:flex-none">Save Photo</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}