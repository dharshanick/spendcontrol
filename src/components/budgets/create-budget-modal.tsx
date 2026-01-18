"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBudgets } from "@/hooks/use-budgets";
import { v4 as uuidv4 } from "uuid";
import { addDays, endOfMonth, startOfMonth, format, addYears } from "date-fns";

interface CreateBudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateBudgetModal({ isOpen, onClose }: CreateBudgetModalProps) {
    const { addBudget } = useBudgets();
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<"weekly" | "monthly" | "yearly">("weekly");

    // NEW: State for Dates (Defaults to Today)
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(addDays(new Date(), 6), 'yyyy-MM-dd'));

    // Auto-update dates when "Budget Type" changes (for convenience)
    useEffect(() => {
        const start = new Date(startDate); // Keep currently selected start date
        let newEnd = new Date();

        if (type === "weekly") {
            newEnd = addDays(start, 6);
        } else if (type === "monthly") {
            // Default to end of the current month of the selected start date
            newEnd = endOfMonth(start);
        } else if (type === "yearly") {
            newEnd = addYears(start, 1);
        }

        setEndDate(format(newEnd, 'yyyy-MM-dd'));
    }, [type, startDate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !startDate || !endDate) return;

        // Determine Title based on Type (Visual only)
        let title = "Custom Budget";
        if (type === "weekly") title = "Weekly Budget";
        if (type === "monthly") title = "Monthly Budget";
        if (type === "yearly") title = "Yearly Budget";

        addBudget({
            id: uuidv4(),
            name: title,
            goal: parseFloat(amount),
            // Use the manually selected dates
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            spent: 0,
            type: type,
        });

        // Reset Form
        setAmount("");
        setStartDate(format(new Date(), 'yyyy-MM-dd'));
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Budget</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">

                    <div className="space-y-2">
                        <Label>Budget Type</Label>
                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Goal Amount</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 5000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Save Budget</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
