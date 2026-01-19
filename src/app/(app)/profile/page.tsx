"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Crown, Camera, Download, Edit2, Wifi, Eye, EyeOff, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

// --- TYPE DEFINITION FOR TRANSACTIONS ---
interface Transaction {
    id: string;
    title: string;
    amount: number;
    type: "income" | "expense";
    date: string;
    category: string;
}

export default function ProfilePage() {
    // --- USER STATE ---
    const [name, setName] = useState("Justin Mason");
    const [email, setEmail] = useState("user@example.com");
    const [avatar, setAvatar] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // --- FINANCIAL STATE (LIVE DATA) ---
    const [balance, setBalance] = useState("₹ 0");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showBalance, setShowBalance] = useState(true);

    // --- CROPPER STATE ---
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. LOAD ALL DATA (User + Financials)
    useEffect(() => {
        // Load User Details
        const savedName = localStorage.getItem("userName");
        const savedEmail = localStorage.getItem("userEmail");
        const savedAvatar = localStorage.getItem("userAvatar");
        if (savedName) setName(savedName);
        if (savedEmail) setEmail(savedEmail);
        if (savedAvatar) setAvatar(savedAvatar);

        // Load Live Transactions
        const savedTxns = localStorage.getItem("transactions");
        if (savedTxns) {
            const parsedTxns: Transaction[] = JSON.parse(savedTxns);
            setTransactions(parsedTxns);

            // Calculate Real Balance
            const income = parsedTxns
                .filter(t => t.type === "income")
                .reduce((sum, t) => sum + t.amount, 0);
            const expense = parsedTxns
                .filter(t => t.type === "expense")
                .reduce((sum, t) => sum + t.amount, 0);

            const totalBalance = income - expense;
            setBalance(`₹ ${totalBalance.toLocaleString()}`);
        }
    }, []);

    // 2. SAVE NAME
    const handleSaveName = () => {
        localStorage.setItem("userName", name);
        setIsEditing(false);
        toast.success("Name updated successfully!");
    };

    // 3. IMAGE SELECT & CROPPER LOGIC
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
            setAvatar(croppedImageBase64);
            localStorage.setItem("userAvatar", croppedImageBase64);
            setIsCropperOpen(false);
            setImageSrc(null);
            toast.success("Profile photo updated!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to crop image.");
        }
    }, [imageSrc, croppedAreaPixels]);

    // 4. GENERATE SMART PDF STATEMENT (With Analysis)
    const generatePDF = () => {
        const doc = new jsPDF();

        // -- HEADER --
        doc.setFillColor(10, 10, 10); // Dark Background
        doc.rect(0, 0, 210, 50, "F");

        doc.setTextColor(34, 197, 94); // Brand Green
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("SpendControl", 14, 25);

        doc.setTextColor(200, 200, 200);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Official Statement of Accounts", 14, 35);
        doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 40);

        // -- FINANCIAL SUMMARY BOX --
        // Calculate totals for the report
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        const netBalance = totalIncome - totalExpense;

        doc.setDrawColor(200, 200, 200);
        doc.roundedRect(14, 60, 180, 25, 2, 2);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text("Total Income", 20, 70);
        doc.text("Total Spent", 80, 70);
        doc.text("Net Balance", 140, 70);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 163, 74); // Green
        doc.text(`+ Rs ${totalIncome}`, 20, 78);

        doc.setTextColor(220, 38, 38); // Red
        doc.text(`- Rs ${totalExpense}`, 80, 78);

        doc.setTextColor(0, 0, 0); // Black
        doc.text(`Rs ${netBalance}`, 140, 78);

        // -- TRANSACTION TABLE --
        // Convert our live transaction data into the format PDF needs
        const tableRows = transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.title,
            t.category,
            t.type === 'income' ? `+ Rs ${t.amount}` : `- Rs ${t.amount}`
        ]);

        autoTable(doc, {
            startY: 95,
            head: [['Date', 'Description', 'Category', 'Amount']],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255] },
            styles: { fontSize: 10, cellPadding: 3 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
        });

        // -- FOOTER --
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Account Holder: ${name} (${email})`, 14, pageHeight - 10);

        doc.save(`SpendControl_Statement_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success("Statement downloaded successfully!");
    };

    return (
        <div className="min-h-screen bg-black pb-24 pt-24 px-4 space-y-8 flex flex-col items-center">

            {/* --- CROPPER MODAL --- */}
            <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Adjust Profile Picture</DialogTitle>
                    </DialogHeader>

                    <div className="relative h-64 w-full bg-black mt-4 rounded-lg overflow-hidden">
                        {imageSrc && (
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1} // Force Square
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        )}
                    </div>

                    <div className="pt-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-400">Zoom</span>
                            <Slider
                                value={[zoom]}
                                min={1} max={3} step={0.1}
                                onValueChange={(val) => setZoom(val[0])}
                                className="flex-1"
                            />
                        </div>
                        <DialogFooter className="flex gap-2">
                            <Button variant="ghost" onClick={() => setIsCropperOpen(false)}>Cancel</Button>
                            <Button onClick={saveCroppedImage} className="bg-green-600 hover:bg-green-500">Save Photo</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>


            {/* --- MAIN UI --- */}
            <div className="text-center space-y-2">
                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    className="hidden"
                    accept="image/*"
                />

                <div className="relative inline-block">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 p-[2px]">
                        <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden relative">
                            {avatar ? (
                                <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-white">{name.charAt(0)}</span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full border-2 border-black cursor-pointer hover:bg-gray-200 transition"
                    >
                        <Camera className="h-4 w-4" />
                    </button>
                </div>

                {!isEditing ? (
                    <div>
                        <h2 className="text-xl font-bold text-white">{name}</h2>
                        <div className="flex justify-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-[10px] font-bold border border-yellow-500/30 flex items-center gap-1">
                                <Crown className="h-3 w-3" /> PREMIUM
                            </span>
                            <button onClick={() => setIsEditing(true)} className="text-xs text-zinc-500 underline ml-2">Edit</button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2 w-64 pt-2">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-center bg-zinc-900 border-zinc-700 h-8 text-sm text-white"
                            placeholder="Enter Name"
                        />
                        <Button onClick={handleSaveName} size="sm" className="w-full bg-green-600 h-7 text-xs text-black font-bold">Save Name</Button>
                    </div>
                )}
            </div>

            {/* --- PREMIUM CARD WITH REAL DATA --- */}
            <div className="relative w-full max-w-sm aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl border border-white/10 transition-transform hover:scale-105 duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
                <div className="absolute -top-10 -right-10 h-32 w-32 bg-green-500/20 blur-3xl rounded-full"></div>

                <div className="relative p-6 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="h-8 w-11 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-md border border-white/20 shadow-sm relative overflow-hidden">
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/20"></div>
                            <div className="absolute top-0 left-1/3 w-[1px] h-full bg-black/20"></div>
                            <div className="absolute top-0 right-1/3 w-[1px] h-full bg-black/20"></div>
                        </div>
                        <Wifi className="h-6 w-6 text-white/50 rotate-90" />
                    </div>

                    <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Total Balance</span>
                        <div className="text-2xl font-mono font-bold text-white tracking-tight flex items-center gap-2">
                            {showBalance ? balance : "••••••"}
                            <button onClick={() => setShowBalance(!showBalance)} className="opacity-50 hover:opacity-100 transition">
                                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-[8px] uppercase text-zinc-500 font-bold mb-0.5">Cardholder Name</div>
                            <div className="font-mono text-sm text-zinc-200 tracking-wider uppercase truncate max-w-[200px]">
                                {name || "YOUR NAME"}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[8px] uppercase text-zinc-500 font-bold mb-0.5">Valid Thru</div>
                            <div className="font-mono text-sm text-zinc-200 tracking-widest">12/30</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ACTION BUTTONS --- */}
            <div className="w-full max-w-sm space-y-3">
                <Button
                    onClick={generatePDF}
                    disabled={transactions.length === 0}
                    variant="outline"
                    className="w-full border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 justify-between h-12"
                >
                    <span className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        {transactions.length === 0 ? "No Transactions Found" : "Download Analysis Statement"}
                    </span>
                    <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">PDF</span>
                </Button>
            </div>

        </div>
    );
}