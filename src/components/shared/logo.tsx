import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* NOTE: Ensure you have a file named 'logo.png' in your 'public' folder.
        If your file is named differently, change src="/logo.png" below.
      */}
      <Image
        src="/logo.png"
        alt="Spend Control Logo"
        width={32}
        height={32}
        className="h-8 w-8 object-contain"
        priority
      />
      <h1 className="text-2xl font-bold text-foreground">
        Spend<span className="text-primary">Control</span>
      </h1>
    </div>
  );
}
