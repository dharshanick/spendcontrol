"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTransactions } from "@/hooks/use-transactions";
import { useCurrency } from "@/hooks/use-currency";
import { format, isWithinInterval, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { Download, FileText, Calendar, Filter, Loader2, Share2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export default function ReportsPage() {
  const { transactions } = useTransactions();
  const { currencySymbol } = useCurrency();

  // Default to current month
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter transactions based on selected range
  const filteredData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set end date time to end of day to include transactions on that day
    end.setHours(23, 59, 59, 999);

    return transactions.filter((t) => {
      const tDate = parseISO(t.date);
      return isWithinInterval(tDate, { start, end });
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, startDate, endDate]);

  // Calculate totals for the selected period
  const totals = useMemo(() => {
    const income = filteredData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [filteredData]);

  // --- PDF GENERATION & SHARE LOGIC ---
  const handleGenerateReport = async () => {
    if (filteredData.length === 0) {
      toast.error("No transactions found in this date range.");
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF();

      // 1. Header Section
      doc.setFillColor(20, 20, 20); // Dark Header
      doc.rect(0, 0, 210, 40, "F");

      doc.setTextColor(34, 197, 94); // Green Brand Color
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("SpendControl", 14, 20);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Financial Statement", 14, 30);

      // 2. Period Info
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text(`Statement Period: ${format(new Date(startDate), "dd MMM yyyy")} to ${format(new Date(endDate), "dd MMM yyyy")}`, 14, 50);
      doc.text(`Generated On: ${format(new Date(), "dd MMM yyyy, HH:mm")}`, 14, 55);

      // 3. Summary Box
      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(14, 65, 180, 25, 3, 3, "FD");

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("Total Income", 20, 75);
      doc.text("Total Expense", 80, 75);
      doc.text("Net Savings", 140, 75);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 163, 74); // Green
      doc.text(`+ ${currencySymbol}${totals.income.toLocaleString()}`, 20, 83);

      doc.setTextColor(220, 38, 38); // Red
      doc.text(`- ${currencySymbol}${totals.expense.toLocaleString()}`, 80, 83);

      doc.setTextColor(0, 0, 0); // Black
      doc.text(`${currencySymbol}${totals.net.toLocaleString()}`, 140, 83);

      // 4. Transaction Table
      const tableRows = filteredData.map(t => [
        format(new Date(t.date), "dd/MM/yyyy"),
        t.title,
        t.category,
        t.type.toUpperCase(),
        `${t.type === 'income' ? '+' : '-'} ${t.amount}`
      ]);

      autoTable(doc, {
        startY: 100,
        head: [['Date', 'Description', 'Category', 'Type', `Amount (${currencySymbol})`]],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] },
        styles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      // 5. Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`SpendControl App - Confidential Financial Report`, 14, doc.internal.pageSize.height - 10);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
      }

      const fileName = `Statement_${startDate}_to_${endDate}.pdf`;

      // --- SHARE LOGIC ---
      // Create a File object from the generated PDF
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      // Check if the browser supports sharing files (Works on most Android/iOS devices)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'SpendControl Statement',
            text: `Here is my financial statement from ${startDate} to ${endDate}.`,
            files: [file],
          });
          toast.success("Shared successfully!");
        } catch (error) {
          if ((error as any).name !== 'AbortError') {
            console.error('Error sharing:', error);
            // If share fails, fallback to download
            doc.save(fileName);
            toast.success("Statement downloaded!");
          }
        }
      } else {
        // Fallback for Desktop or browsers that don't support sharing
        doc.save(fileName);
        toast.success("Statement downloaded!");
      }

    } catch (e) {
      console.error(e);
      toast.error("Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    /* UPDATED: Added pt-24 for mobile to push content below the menu button */
    <div className="space-y-6 pb-24 px-4 md:px-0 pt-24 md:pt-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Statements</h1>
        <p className="text-muted-foreground mt-1">Select a date range to generate and share your financial statement.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {/* --- CONTROL PANEL --- */}
        <Card className="shadow-lg border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-green-500" />
              Report Settings
            </CardTitle>
            <CardDescription>Choose the duration for your statement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-900"
                />
              </div>
            </div>

            {/* Summary Preview */}
            <div className="p-4 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl space-y-3 border border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transactions found:</span>
                <span className="font-bold">{filteredData.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Net Balance:</span>
                <span className={`font-bold ${totals.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {currencySymbol}{totals.net.toLocaleString()}
                </span>
              </div>
            </div>

            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 transition-all active:scale-95"
              onClick={handleGenerateReport}
              disabled={isGenerating || filteredData.length === 0}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? "Generating..." : "Download & Share PDF"}
            </Button>
          </CardContent>
        </Card>

        {/* --- PREVIEW LIST --- */}
        <Card className="h-[400px] flex flex-col shadow-lg border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Preview Data
            </CardTitle>
            <CardDescription>Transactions included in this report.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 space-y-2">
            {filteredData.length > 0 ? (
              filteredData.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[120px]">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(t.date), "dd MMM")}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-zinc-900 dark:text-white'}`}>
                    {currencySymbol}{t.amount}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-50">
                <Calendar className="h-10 w-10" />
                <p className="text-sm">No transactions in range</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}