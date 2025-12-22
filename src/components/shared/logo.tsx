
import { cn } from "@/lib/utils";

const CustomLogoIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    className={className}
    width="32"
    height="32"
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(140, 70%, 40%)', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path
      fill="url(#logoGradient)"
      d="M32 208h192v16H32zM48 192h24v-80H48zM96 192h24v-80H96zM144 192h24v-80h-24zM192 192h24v-80h-24zM32 96h192L128 32 32 96z"
    />
  </svg>
);


export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <CustomLogoIcon className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-bold text-foreground">
        Spend<span className="text-primary">Control</span>
      </h1>
    </div>
  );
}
