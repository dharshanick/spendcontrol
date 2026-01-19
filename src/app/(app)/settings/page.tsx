"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { Moon, Sun, Laptop, Download, Upload, Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/use-currency";
import { useRef, useState, useEffect } from "react"; // 1. Add useState, useEffect

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { currencySymbol, setCurrency } = useCurrency();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 2. HYDRATION FIX: Wait for client mount ---
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until the theme is known
  if (!mounted) {
    return null;
  }
  // ------------------------------------------------

  // --- BACKUP LOGIC ---
  const handleExport = () => {
    const data = {
      transactions: localStorage.getItem('transactions-storage'),
      budgets: localStorage.getItem('budgets-storage'),
      game: localStorage.getItem('game-storage'),
      privacy: localStorage.getItem('privacy-storage'),
      version: "1.0"
    };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SpendControl_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.transactions) localStorage.setItem('transactions-storage', data.transactions);
        if (data.budgets) localStorage.setItem('budgets-storage', data.budgets);
        if (data.game) localStorage.setItem('game-storage', data.game);

        alert("Data restored successfully! Refreshing...");
        window.location.reload();
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm("ARE YOU SURE? This will delete all your data permanently.")) {
      localStorage.clear();
      window.location.reload();
    }
  }

  return (
    <div className="space-y-6 pt-24 pb-24 px-4 min-h-screen">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your app preferences and data.</p>
      </div>

      {/* 1. APPEARANCE */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how SpendControl looks on your device.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <Button variant="outline" className={`h-24 flex-col gap-2 ${theme === 'light' ? 'border-green-500 bg-green-500/10' : ''}`} onClick={() => setTheme("light")}>
            <Sun className="h-6 w-6" /> Light
          </Button>
          <Button variant="outline" className={`h-24 flex-col gap-2 ${theme === 'dark' ? 'border-green-500 bg-green-500/10' : ''}`} onClick={() => setTheme("dark")}>
            <Moon className="h-6 w-6" /> Dark
          </Button>
          <Button variant="outline" className={`h-24 flex-col gap-2 ${theme === 'system' ? 'border-green-500 bg-green-500/10' : ''}`} onClick={() => setTheme("system")}>
            <Laptop className="h-6 w-6" /> System
          </Button>
        </CardContent>
      </Card>

      {/* 2. CURRENCY */}
      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
          <CardDescription>Choose your preferred currency symbol.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          {[
            { code: 'INR', symbol: '₹' },
            { code: 'USD', symbol: '$' },
            { code: 'EUR', symbol: '€' },
            { code: 'GBP', symbol: '£' },
            { code: 'JPY', symbol: '¥' },
          ].map((item) => (
            <Button
              key={item.code}
              variant="outline"
              className={`w-12 h-12 text-lg ${currencySymbol === item.symbol ? 'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:text-white' : ''}`}
              onClick={() => setCurrency(item.code as any)}
            >
              {item.symbol}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* 3. DATA MANAGEMENT */}
      <Card className="border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" /> Data Management
          </CardTitle>
          <CardDescription>Backup your finances or restore from a file.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={handleExport}>
              <Download className="h-6 w-6 text-green-500" />
              <div className="text-center">
                <span className="font-bold block">Backup Data</span>
                <span className="text-xs text-muted-foreground">Download JSON file</span>
              </div>
            </Button>

            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-6 w-6 text-blue-500" />
              <div className="text-center">
                <span className="font-bold block">Restore Data</span>
                <span className="text-xs text-muted-foreground">Upload JSON file</span>
              </div>
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <Button variant="destructive" className="w-full gap-2" onClick={handleReset}>
              <RefreshCw className="h-4 w-4" /> Reset App (Delete All Data)
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}