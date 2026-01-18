"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Star, Medal, Gamepad2, Share2, Crown, User, Mail, Calendar as CalendarIcon, Wallet, Wifi, Edit3, Camera, Upload, Check, Eye, EyeOff, FileText, Download } from "lucide-react";
import { useState, useRef, ChangeEvent, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";
import { useGame } from "@/hooks/use-game";
import { usePrivacy } from "@/hooks/use-privacy";
import { useTransactions } from "@/hooks/use-transactions";
import { useCurrency } from "@/hooks/use-currency";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { saveAndOpenPDF } from "@/lib/download-helper";

export default function ProfilePage() {
    const { score } = useGame();
    const { isPrivacyMode, togglePrivacy } = usePrivacy();
    const { transactions } = useTransactions();
    const { currencySymbol } = useCurrency();

    const hasThreeStars = score >= 60;
    const level = Math.floor(score / 10);

    // Profile Data
    const [profile, setProfile] = useState({
        name: "Justin Mason",
        email: "user@example.com",
        image: null as string | null,
    });

    // Edit/Crop State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({ ...profile });
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- PDF GENERATOR (FIXED) ---
    const generatePDF = async () => {
        const doc = new jsPDF();

        // 1. Calculate Totals for the PDF
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const netSavings = totalIncome - totalExpense;

        // Helper to format currency safely for PDF (AVOIDING '₹' symbol)
        const formatMoney = (amt: number) => `INR ${amt.toLocaleString()}`;

        // --- HEADER ---
        doc.setFontSize(22);
        doc.setTextColor("#16a34a"); // Green
        doc.setFont("helvetica", "bold");
        doc.text("SpendControl", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        doc.text("Official Monthly Statement", 14, 26);

        doc.setDrawColor(200);
        doc.line(14, 32, 196, 32);

        // --- ACCOUNT DETAILS ---
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Account Holder: ${profile.name}`, 14, 45);
        doc.text(`Email: ${profile.email}`, 14, 52);
        doc.text(`Generated On: ${format(new Date(), "dd MMM yyyy, HH:mm")}`, 14, 59);

        // --- TRANSACTION TABLE ---
        const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const tableData = sortedTransactions.map(t => [
            format(new Date(t.date), "yyyy-MM-dd"),
            t.title,
            t.category,
            t.type.toUpperCase(),
            // FIX: Using "INR" instead of symbol to prevent garbled text
            `${t.type === 'income' ? '+' : '-'} ${t.amount.toLocaleString()}`
        ]);

        autoTable(doc, {
            startY: 70,
            head: [["Date", "Description", "Category", "Type", "Amount (INR)"]],
            body: tableData,
            theme: "grid",
            headStyles: { fillColor: [22, 163, 74], textColor: 255 },
            styles: { fontSize: 10, cellPadding: 3 },
            alternateRowStyles: { fillColor: [240, 253, 244] },
        });

        // --- FINAL SUMMARY (AT THE BOTTOM) ---
        const finalY = (doc as any).lastAutoTable.finalY + 10;

        // Draw Summary Box
        doc.setFillColor(245, 245, 245); // Light Gray
        doc.roundedRect(14, finalY, 182, 40, 2, 2, "F");

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text("Statement Summary", 20, finalY + 10);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        // Labels
        doc.text("Total Income:", 20, finalY + 20);
        doc.text("Total Expenses:", 20, finalY + 28);
        doc.text("Net Savings:", 20, finalY + 36);

        // Values (Right Aligned mostly)
        doc.setFont("helvetica", "bold");

        doc.setTextColor(22, 163, 74); // Green
        doc.text(formatMoney(totalIncome), 80, finalY + 20);

        doc.setTextColor(220, 38, 38); // Red
        doc.text(formatMoney(totalExpense), 80, finalY + 28);

        doc.setTextColor(0); // Black for savings
        doc.text(formatMoney(netSavings), 80, finalY + 36);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Generated by SpendControl App. This document is for personal record keeping.", 105, finalY + 50, { align: "center" });

        await saveAndOpenPDF(doc, `SpendControl_Statement_${format(new Date(), "yyyy-MM-dd")}.pdf`);
    };

    // --- HANDLERS (Crop/Edit) ---
    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageSrc(reader.result as string);
                setIsCropping(true);
                setZoom(1);
                setCrop({ x: 0, y: 0 });
            };
            reader.readAsDataURL(file);
        }
    };

    const createCroppedImage = async () => {
        try {
            if (!imageSrc || !croppedAreaPixels) return;
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedImage) {
                setPreviewImage(croppedImage);
                setIsCropping(false);
                setImageSrc(null);
            }
        } catch (e) { console.error(e); }
    };

    const saveProfile = () => {
        setProfile({ ...editForm, image: previewImage || editForm.image });
        setIsEditOpen(false);
    };

    const openEditModal = () => {
        setEditForm({ ...profile });
        setPreviewImage(profile.image);
        setIsEditOpen(true);
        setIsCropping(false);
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-24">

            {/* 1. TOP SECTION: CREDIT CARD & PROFILE HEADER */}
            <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* PLATINUM CARD */}
                <div className="relative w-full md:w-[420px] aspect-[1.58/1] rounded-2xl p-6 shadow-2xl overflow-hidden group transition-transform hover:scale-[1.02] duration-300 border border-zinc-400/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-400 z-0"></div>
                    <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0 mix-blend-multiply"></div>
                    <div className="absolute -top-[100%] -left-[100%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/40 to-transparent rotate-45 pointer-events-none"></div>
                    <div className="absolute inset-3 border-2 border-zinc-400/30 rounded-xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col justify-between h-full text-zinc-800">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-10 rounded-md bg-gradient-to-br from-zinc-300 to-zinc-400 border border-zinc-500 shadow-inner relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute inset-0 border-[0.5px] border-black/30 rounded-md grid grid-cols-2 grid-rows-2">
                                        <div className="border-r border-b border-black/30"></div><div className="border-b border-black/30"></div><div className="border-r border-black/30"></div>
                                    </div>
                                </div>
                                <Wifi className="h-6 w-6 text-zinc-600 rotate-90" />
                            </div>
                            <div className="text-right">
                                <h3 className="text-lg font-bold italic tracking-tighter text-black">Spend<span className="text-green-600">Control</span></h3>
                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Platinum Business</p>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {profile.image && (
                                    <div className="w-12 h-12 rounded-full border-2 border-zinc-400 overflow-hidden shadow-sm grayscale hover:grayscale-0 transition-all">
                                        <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex gap-4 text-xl md:text-2xl font-mono tracking-widest text-zinc-800 drop-shadow-sm font-bold">
                                    <span className="opacity-80">••••</span><span className="opacity-80">••••</span><span className="opacity-80">••••</span><span>2026</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                            <div className="space-y-1">
                                <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Cardholder</p>
                                <p className="text-sm md:text-lg font-bold tracking-wide uppercase font-mono truncate max-w-[200px] text-black">{profile.name}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Valid Thru</p>
                                <p className="text-sm font-bold font-mono text-black">01/30</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PROFILE ACTIONS */}
                <div className="flex-1 space-y-6 w-full">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-full bg-secondary border-2 border-border overflow-hidden flex items-center justify-center">
                                {profile.image ? <img src={profile.image} alt="User" className="w-full h-full object-cover" /> : <span className="text-2xl font-bold text-muted-foreground">{profile.name.charAt(0)}</span>}
                            </div>
                            <button onClick={openEditModal} className="absolute bottom-0 right-0 bg-green-600 p-1.5 rounded-full text-white shadow-lg hover:bg-green-500 transition-colors"><Edit3 className="h-3 w-3" /></button>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
                            <p className="text-muted-foreground flex items-center gap-2 mt-1"><Mail className="h-4 w-4" /> {profile.email}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary flex items-center gap-2"><Crown className="h-3.5 w-3.5 text-yellow-500" /> Premium Member</div>
                        {hasThreeStars && <div className="px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-xs font-bold text-yellow-500 flex items-center gap-2"><Star className="h-3.5 w-3.5 fill-current" /> Elite Status</div>}
                        <div className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-bold text-green-500 flex items-center gap-2"><Trophy className="h-3.5 w-3.5" /> Level {level}</div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        <Button variant="outline" className="flex-1" onClick={openEditModal}>
                            <Edit3 className="h-4 w-4 mr-2" /> Edit
                        </Button>

                        <Button variant="outline" className="flex-1 border-zinc-700 hover:bg-muted" onClick={togglePrivacy}>
                            {isPrivacyMode ? <><EyeOff className="h-4 w-4 mr-2" /> Show Balance</> : <><Eye className="h-4 w-4 mr-2" /> Hide Balance</>}
                        </Button>

                        {/* DOWNLOAD BUTTON */}
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                            onClick={generatePDF}
                        >
                            <Download className="h-4 w-4 mr-2" /> Statement
                        </Button>
                    </div>
                </div>
            </div>

            {/* 2. STATS GRID */}
            <div className="grid gap-6 md:grid-cols-2 mt-8">
                <Card className="bg-card border-border shadow-sm">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-foreground"><Gamepad2 className="h-5 w-5 text-purple-500" /> Game Rewards</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Current Score</span><span className="font-bold text-green-500">{score} / 100</span></div>
                            <Progress value={Math.min(score, 100)} className="h-2 bg-secondary" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 text-center transition-all ${score >= 60 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-border bg-muted/30 grayscale opacity-50'}`}>
                                <div className={`p-2 rounded-full mb-2 ${score >= 60 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-secondary'}`}><Trophy className={`h-4 w-4 ${score >= 60 ? 'text-white' : 'text-muted-foreground'}`} /></div>
                                <span className={`text-[10px] font-bold uppercase ${score >= 60 ? 'text-yellow-600 dark:text-yellow-500' : 'text-muted-foreground'}`}>Guardian</span>
                            </div>
                            <div className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 text-center transition-all ${score >= 100 ? 'border-purple-500/30 bg-purple-500/5' : 'border-border bg-muted/30 grayscale opacity-50 border-dashed'}`}>
                                <div className={`p-2 rounded-full mb-2 ${score >= 100 ? 'bg-purple-600' : 'bg-secondary'}`}><Medal className={`h-4 w-4 ${score >= 100 ? 'text-white' : 'text-muted-foreground'}`} /></div>
                                <span className={`text-[10px] font-bold uppercase ${score >= 100 ? 'text-purple-600 dark:text-purple-500' : 'text-muted-foreground'}`}>Legend</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-foreground"><User className="h-5 w-5 text-blue-500" /> Account Details</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><div className="flex items-center gap-3"><CalendarIcon className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Member Since</span></div><span className="text-sm font-medium text-foreground">Jan 2026</span></div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><div className="flex items-center gap-3"><Wallet className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Currency</span></div><span className="text-sm font-medium text-foreground">Indian Rupee (₹)</span></div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><div className="flex items-center gap-3"><Crown className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Subscription</span></div><span className="text-sm font-bold text-green-600 dark:text-green-400">Premium Plan</span></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* EDIT MODAL */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader><DialogTitle>{isCropping ? "Crop Profile Picture" : "Edit Profile"}</DialogTitle><DialogDescription>{isCropping ? "Drag and zoom to position your photo." : "Update your details."}</DialogDescription></DialogHeader>
                    {isCropping && imageSrc ? (
                        <div className="py-4">
                            <div className="relative w-full h-[300px] bg-black rounded-lg overflow-hidden border border-zinc-700">
                                <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} showGrid={false} cropShape="round" />
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground"><span>Zoom</span><span>{Math.round(zoom * 100)}%</span></div>
                                <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-green-500" />
                            </div>
                            <DialogFooter className="mt-4 flex gap-2"><Button variant="outline" onClick={() => setIsCropping(false)}>Back</Button><Button onClick={createCroppedImage} className="bg-green-600 hover:bg-green-700 text-white"><Check className="h-4 w-4 mr-2" /> Apply Crop</Button></DialogFooter>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-6 py-4">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-input bg-muted flex items-center justify-center overflow-hidden group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        {previewImage ? <img src={previewImage} alt="Preview" className="w-full h-full object-cover" /> : <Camera className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors" />}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload className="h-6 w-6 text-white" /></div>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                    <p className="text-xs text-muted-foreground">Click to upload & crop</p>
                                </div>
                                <div className="grid gap-2"><Label htmlFor="name">Display Name</Label><Input id="name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
                                <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" value={editForm.email} readOnly className="bg-muted text-muted-foreground cursor-not-allowed" /></div>
                            </div>
                            <DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button onClick={saveProfile} className="bg-green-600 hover:bg-green-700 text-white">Save Changes</Button></DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Helper
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string | null> {
    const createImage = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.addEventListener("load", () => resolve(image)); image.addEventListener("error", (error) => reject(error)); image.setAttribute("crossOrigin", "anonymous"); image.src = url; });
    const image = await createImage(imageSrc); const canvas = document.createElement("canvas"); const ctx = canvas.getContext("2d"); if (!ctx) return null;
    canvas.width = pixelCrop.width; canvas.height = pixelCrop.height;
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return canvas.toDataURL("image/jpeg");
}