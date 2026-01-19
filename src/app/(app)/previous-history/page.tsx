"use client";

import { useState, useMemo, useEffect } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { format, getYear, getMonth, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SummaryCard from "@/components/dashboard/summary-card";
import CategoryIcon from "@/components/shared/category-icon";
import { Archive, CircleDollarSign, IndianRupee, Wallet, Filter, ArrowRight, Trash2, Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";

export default function PreviousHistoryPage() {
    const { transactions, deleteTransaction } = useTransactions();
    const { currencySymbol } = useCurrency();

    // Get available years from data
    const availableYears = useMemo(() => {
        const years = new Set(transactions.map((t) => getYear(parseISO(t.date))));
        if (years.size === 0) return [new Date().getFullYear()];
        return Array.from(years).sort((a, b) => a - b);
    }, [transactions]);

    // STATE
    const [startYear, setStartYear] = useState<string>("");
    const [endYear, setEndYear] = useState<string>("");
    const [startMonth, setStartMonth] = useState<string>("0");  // Jan
    const [endMonth, setEndMonth] = useState<string>("11");    // Dec
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [searchTerm, setSearchTerm] = useState(""); // ✅ Added Search

    // Initialize years
    useEffect(() => {
        if (availableYears.length > 0 && !startYear) {
            setStartYear(availableYears[0].toString());
            setEndYear(availableYears[availableYears.length - 1].toString());
        }
    }, [availableYears, startYear]);

    // Static list of months
    const allMonths = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => ({
            value: i.toString(),
            label: format(new Date(2024, i, 1), "MMMM")
        }));
    }, []);

    // LOGIC: Filter Transactions
    const filteredTransactions = useMemo(() => {
        if (!startYear || !endYear) return [];

        let result = transactions.filter(t => {
            const tDate = parseISO(t.date);
            const tYear = getYear(tDate);
            const tMonth = getMonth(tDate);
            const sYear = parseInt(startYear);
            const eYear = parseInt(endYear);

            // Year Range
            if (tYear < sYear || tYear > eYear) return false;

            // Month Range (only if single year selected)
            if (sYear === eYear) {
                const sMonth = parseInt(startMonth);
                const eMonth = parseInt(endMonth);
                if (tMonth < sMonth || tMonth > eMonth) return false;
            }

            // Category Filter
            if (selectedCategory !== "All" && t.category !== selectedCategory) return false;

            // ✅ Search Filter (Title)
            if (searchTerm && !t.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;

            return true;
        });

        return result.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    }, [transactions, startYear, endYear, startMonth, endMonth, selectedCategory, searchTerm]);

    // LOGIC: Dynamic Categories
    const availableCategories = useMemo(() => {
        const categories = new Set(transactions.map(t => t.category));
        return ["All", ...Array.from(categories).sort()];
    }, [transactions]);

    // LOGIC: Summary
    const summary = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return { income, expenses, savings: income - expenses };
    }, [filteredTransactions]);

    // ✅ LOGIC: Export CSV
    const handleExportCSV = () => {
        if (filteredTransactions.length === 0) return;
        const headers = ["Date", "Title", "Category", "Type", "Amount"];
        const rows = filteredTransactions.map(t => [
            format(parseISO(t.date), "yyyy-MM-dd"),
            `"${t.title}"`,
            t.category,
            t.type,
            t.amount
        ]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `spendcontrol_history.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const isMultiYear = startYear !== endYear;

    return (
        <div className="space-y-6 pt-24 pb-24 px-4 min-h-screen">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Archive className="h-6 w-6" /> Previous History
                            </CardTitle>
                            <CardDescription>Manage and analyze your financial database.</CardDescription>
                        </div>
                        {/* ✅ Export Button */}
                        <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={filteredTransactions.length === 0}>
                            <Download className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* FILTERS */}
                    <div className="flex flex-col gap-4 mb-6 p-4 bg-muted/20 rounded-lg border">

                        {/* Row 1: Time */}
                        <div className="flex flex-col xl:flex-row gap-4 xl:items-center">
                            <div className="flex items-center gap-2">
                                <Select value={startYear} onValueChange={(val) => {
                                    setStartYear(val);
                                    if (parseInt(val) > parseInt(endYear)) setEndYear(val);
                                }}>
                                    <SelectTrigger className="w-[100px]"><SelectValue placeholder="From" /></SelectTrigger>
                                    <SelectContent>{availableYears.map((y) => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                                </Select>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <Select value={endYear} onValueChange={setEndYear}>
                                    <SelectTrigger className="w-[100px]"><SelectValue placeholder="To" /></SelectTrigger>
                                    <SelectContent>{availableYears.map((y) => <SelectItem key={y} value={y.toString()} disabled={y < parseInt(startYear)}>{y}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>

                            <div className={cn("flex items-center gap-2 transition-opacity", isMultiYear && "opacity-30 pointer-events-none")}>
                                <Select value={startMonth} onValueChange={setStartMonth} disabled={isMultiYear}>
                                    <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>{allMonths.map((m) => <SelectItem key={m.value} value={m.value} disabled={parseInt(m.value) > parseInt(endMonth)}>{m.label}</SelectItem>)}</SelectContent>
                                </Select>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <Select value={endMonth} onValueChange={setEndMonth} disabled={isMultiYear}>
                                    <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>{allMonths.map((m) => <SelectItem key={m.value} value={m.value} disabled={parseInt(m.value) < parseInt(startMonth)}>{m.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Row 2: Category & Search */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <div className="flex items-center gap-2"><Filter className="h-4 w-4" /><SelectValue /></div>
                                </SelectTrigger>
                                <SelectContent>{availableCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>

                            {/* ✅ Search Bar */}
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by title..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SUMMARY CARDS */}
                    {filteredTransactions.length > 0 ? (
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <SummaryCard title="Total Income" amount={summary.income} icon={<IndianRupee />} comparison={0} />
                                <SummaryCard title="Total Expenses" amount={summary.expenses} icon={<CircleDollarSign />} comparison={0} />
                                <SummaryCard title="Net Savings" amount={summary.savings} icon={<Wallet />} comparison={0} />
                            </div>

                            {/* TABLE */}
                            <Card className="border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead className="hidden md:table-cell">Category</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="w-[50px]"></TableHead> {/* Delete Column */}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTransactions.map(t => (
                                            <TableRow key={t.id}>
                                                <TableCell>
                                                    <div className="font-medium">{t.title}</div>
                                                    <div className="md:hidden text-xs text-muted-foreground">{t.category}</div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <CategoryIcon category={t.category} className="h-4 w-4" />
                                                        {t.category}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{format(parseISO(t.date), "MMM d, yyyy")}</TableCell>
                                                <TableCell className={cn("text-right font-semibold", t.type === 'income' ? 'text-green-500' : 'text-red-500')}>
                                                    {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString()}
                                                </TableCell>
                                                {/* ✅ Delete Button */}
                                                <TableCell>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                                        onClick={() => { if (confirm("Delete this transaction permanently?")) deleteTransaction(t.id); }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg opacity-50">
                            <p>No transactions found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}