import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
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
          <div className="min-h-screen bg-background pt-[env(safe-area-inset-top)]">
            <AppLock>{children}</AppLock>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
