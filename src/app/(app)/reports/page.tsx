"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Wallet, Download } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { useCurrency } from "@/hooks/use-currency";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage() {
  const { transactions } = useTransactions();
  const { currencySymbol } = useCurrency();

  // --- CALCULATE TOTALS ---
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : "0";

  // --- PDF GENERATOR ---
  const generatePDF = () => {
    const doc = new jsPDF();
    const formatMoney = (amt: number) => `INR ${amt.toLocaleString()}`;

    // Header
    doc.setFontSize(22);
    doc.setTextColor("#16a34a");
    doc.setFont("helvetica", "bold");
    doc.text("SpendControl", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Full Financial Report", 14, 26);

    doc.setDrawColor(200);
    doc.line(14, 32, 196, 32);

    // Summary Section
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, 40, 182, 40, 2, 2, "F");

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 20, 50);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Income: ${formatMoney(totalIncome)}`, 20, 60);
    doc.text(`Total Expense: ${formatMoney(totalExpense)}`, 20, 68);
    doc.text(`Net Savings: ${formatMoney(totalSavings)}`, 20, 76);

    // Table
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const tableData = sortedTransactions.map(t => [
      format(new Date(t.date), "yyyy-MM-dd"),
      t.title,
      t.category,
      t.type.toUpperCase(),
      `${t.type === 'income' ? '+' : '-'} ${t.amount.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 90,
      head: [["Date", "Description", "Category", "Type", "Amount (INR)"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [22, 163, 74] },
    });

    doc.save(`SpendControl_Full_Report.pdf`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Reports</h2>
          <p className="text-muted-foreground">A detailed breakdown of your wealth and spending.</p>
        </div>
        <Button onClick={generatePDF} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20">
          <Download className="h-4 w-4 mr-2" /> Download PDF Report
        </Button>
      </div>

      {/* 1. BIG SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* INCOME CARD */}
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {currencySymbol}{totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time earnings</p>
          </CardContent>
        </Card>

        {/* EXPENSE CARD */}
        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/5 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-500 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" /> Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {currencySymbol}{totalExpense.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time expenses</p>
          </CardContent>
        </Card>

        {/* SAVINGS CARD */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-500 flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Net Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              {currencySymbol}{totalSavings.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold bg-blue-500/20 text-blue-600 px-1.5 py-0.5 rounded">
                {savingsRate}% Saved
              </span>
              <p className="text-xs text-muted-foreground">of total income</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. VISUAL BREAKDOWN */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Visualization</CardTitle>
          <CardDescription>Visual representation of your income vs expenses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Income Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Income</span>
              <span>{currencySymbol}{totalIncome.toLocaleString()}</span>
            </div>
            <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-full animate-in slide-in-from-left duration-1000"></div>
            </div>
          </div>

          {/* Expense Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Expenses</span>
              <span>{currencySymbol}{totalExpense.toLocaleString()}</span>
            </div>
            <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-1000"
                style={{ width: `${totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Savings Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Remaining Savings</span>
              <span>{currencySymbol}{totalSavings.toLocaleString()}</span>
            </div>
            <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-1000"
                style={{ width: `${totalIncome > 0 ? Math.min((totalSavings / totalIncome) * 100, 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
