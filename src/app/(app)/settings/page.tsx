"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; // Import Switch
import { useUser } from "@/hooks/use-user";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { Moon, Sun, Monitor, Trash2, Download, Upload, FileJson, Bell, Smartphone } from "lucide-react";

export default function SettingsPage() {
  const { user, updateUser } = useUser() as any; 
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [vibrationEnabled, setVibrationEnabled] = useState(false); // New State
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && user.name) setName(user.name);
    
    // Load Vibration Setting
    const savedVibrate = localStorage.getItem("spendcontrol_vibration");
    setVibrationEnabled(savedVibrate === "true");
  }, [user]);

  const handleSaveName = () => {
    if (updateUser) updateUser({ name });
  };

  const toggleVibration = (checked: boolean) => {
    setVibrationEnabled(checked);
    localStorage.setItem("spendcontrol_vibration", String(checked));
    
    // Test vibration when turned on (if supported)
    if (checked && navigator.vibrate) {
        navigator.vibrate(200);
    }
  };

  // --- EXISTING EXPORT/IMPORT LOGIC ---
  const handleExportData = () => {
    const backupData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) backupData[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spendcontrol_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const json = e.target?.result as string;
            const parsedData = JSON.parse(json);
            if (confirm("Overwrite current data with backup?")) {
                localStorage.clear();
                Object.keys(parsedData).forEach((key) => localStorage.setItem(key, parsedData[key]));
                window.location.reload();
            }
        } catch (error) {
            alert("Invalid backup file!");
        }
    };
    reader.readAsText(file);
  };

  const handleResetApp = () => {
    if(confirm("Delete ALL data permanently?")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

      {/* 1. APP PREFERENCES */}
      <Card>
        <CardHeader>
          <CardTitle>App Preferences</CardTitle>
          <CardDescription>Customize look and feel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <div className="flex gap-2">
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
                    <Button onClick={handleSaveName}>Save</Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-4">
                    <Button variant={theme === "light" ? "default" : "outline"} className="flex-1" onClick={() => setTheme("light")}><Sun className="mr-2 h-4 w-4" /> Light</Button>
                    <Button variant={theme === "dark" ? "default" : "outline"} className="flex-1" onClick={() => setTheme("dark")}><Moon className="mr-2 h-4 w-4" /> Dark</Button>
                    <Button variant={theme === "system" ? "default" : "outline"} className="flex-1" onClick={() => setTheme("system")}><Monitor className="mr-2 h-4 w-4" /> System</Button>
                </div>
            </div>
            
            {/* NEW: NOTIFICATIONS & VIBRATION */}
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-medium">
                        <Smartphone className="h-4 w-4" /> Vibration Alerts
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Vibrate device when a To-Do reminder is due.
                    </div>
                </div>
                <Switch 
                    checked={vibrationEnabled}
                    onCheckedChange={toggleVibration}
                />
            </div>
        </CardContent>
      </Card>

      {/* 2. BACKUP & RESTORE */}
      <Card className="border-blue-200 dark:border-blue-900">
        <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2"><FileJson className="h-5 w-5" /> Data Backup</CardTitle>
            <CardDescription>Save or restore your data.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleExportData} variant="outline"><Download className="mr-2 h-4 w-4" /> Export Data</Button>
            <div className="relative">
                <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportData} className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} className="w-full" variant="outline"><Upload className="mr-2 h-4 w-4" /> Import Data</Button>
            </div>
        </CardContent>
      </Card>

      {/* 3. DANGER ZONE */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader><CardTitle className="text-red-600">Danger Zone</CardTitle></CardHeader>
        <CardContent>
           <div className="flex items-center justify-between">
                <div><p className="font-medium">Reset App</p><p className="text-sm text-muted-foreground">Delete all data permanently.</p></div>
                <Button variant="destructive" onClick={handleResetApp}><Trash2 className="mr-2 h-4 w-4" /> Reset</Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}