import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";  // <--- This file MUST have this import
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import AppLock from "@/components/security/app-lock";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "SpendControl",
  description: "Track your expenses offline.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png"></link>
        <meta name="theme-color" content="#1C1C1C" />
      </head>
      <body className={cn("antialiased font-body", inter.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* -------------------------------------------------------
             CRITICAL FIX IS HERE:
             1. We removed 'pt-[env(safe-area-inset-top)]'
             2. We added 'h-full' to ensure no scrolling glitches
             -------------------------------------------------------
          */}
          <div className="min-h-screen bg-background h-full">
            <AppLock>{children}</AppLock>
          </div>
          <Toaster />
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
