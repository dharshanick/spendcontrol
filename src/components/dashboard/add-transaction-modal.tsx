"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, Utensils, Plane, ShoppingBag, Receipt, Gamepad2, HeartPulse, Briefcase, Zap, MoreHorizontal } from "lucide-react"; // Import new icons
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/use-transactions";
import { v4 as uuidv4 } from 'uuid';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "income" | "expense";
}

// DEFINED CATEGORIES WITH ICONS
const CATEGORIES = [
    { id: "Food", icon: Utensils, color: "text-orange-500" },
    { id: "Travel", icon: Plane, color: "text-blue-500" },
    { id: "Shopping", icon: ShoppingBag, color: "text-pink-500" },
    { id: "Bills", icon: Receipt, color: "text-yellow-500" },
    { id: "Entertainment", icon: Gamepad2, color: "text-purple-500" },
    { id: "Health", icon: HeartPulse, color: "text-red-500" },
    { id: "Work", icon: Briefcase, color: "text-cyan-500" },
    { id: "Other", icon: MoreHorizontal, color: "text-gray-500" },
];

export default function AddTransactionModal({ isOpen, onClose, type }: AddTransactionModalProps) {
    const { addTransaction } = useTransactions();

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Food"); // Default
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState(format(new Date(), "HH:mm"));

    useEffect(() => {
        if (isOpen) {
            setTitle("");
            setAmount("");
            setCategory("Food");
            setDate(new Date());
            setTime(format(new Date(), "HH:mm"));
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (!title || !amount || !date) return;
        const finalDate = new Date(date);
        const [hours, minutes] = time.split(":").map(Number);
        finalDate.setHours(hours, minutes);

        addTransaction({
            id: uuidv4(),
            type,
            title,
            amount: parseFloat(amount),
            category, // Saves the string ID (e.g., "Food")
            date: finalDate.toISOString(),
        });
        onClose();
    };

    const isExpense = type === 'expense';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-black border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>{isExpense ? "Add New Expense" : "Add New Income"}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">

                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            placeholder={isExpense ? "e.g., Burger King" : "e.g., Salary"}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-zinc-900 border-zinc-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Amount</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-zinc-400">₹</span>
                            <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-8 bg-zinc-900 border-zinc-700" />
                        </div>
                        <div className="flex gap-2 mt-2">
                            {[100, 200, 500].map((val) => (
                                <button key={val} onClick={() => setAmount((parseFloat(amount || "0") + val).toString())} className="px-3 py-1 rounded-md bg-zinc-800 text-xs border border-zinc-700 hover:bg-zinc-700 transition-colors">+{val}</button>
                            ))}
                        </div>
                    </div>

                    {/* NEW: VISUAL CATEGORY SELECTOR */}
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                const isSelected = category === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(cat.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all",
                                            isSelected
                                                ? "bg-green-500/10 border-green-500 text-green-500"
                                                : "bg-zinc-900 border-zinc-700 text-muted-foreground hover:bg-zinc-800"
                                        )}
                                    >
                                        <Icon className={cn("h-5 w-5", isSelected ? "text-green-500" : cat.color)} />
                                        <span className="text-[10px] font-medium">{cat.id}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className="w-full justify-start text-left font-normal bg-zinc-900 border-zinc-700">
                                        <CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date, "dd-MM-yyyy") : <span>Pick date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800">
                                    <Calendar mode="single" selected={date} onSelect={setDate} className="bg-zinc-900 text-white" />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Time</Label>
                            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-zinc-900 border-zinc-700" />
                        </div>
                    </div>

                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit} className={cn("w-full text-white shadow-lg", isExpense ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700")}>
                        {isExpense ? "Save Expense" : "Save Income"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
