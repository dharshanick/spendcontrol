import { ArrowUp, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthIllustration() {
  return (
    <Card className="hidden lg:flex flex-col items-center justify-center p-8 border-0 bg-card/50 w-full h-full">
      <CardContent className="flex flex-col items-center justify-center text-center gap-4">
        <div className="relative">
          <BarChart3 className="h-32 w-32 text-primary/50" strokeWidth={1} />
          <ArrowUp className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold">
          Unlock Your Financial Potential
        </h2>
        <p className="text-muted-foreground max-w-sm">
          The easiest way to track expenses and plan your financial future.
        </p>
      </CardContent>
    </Card>
  );
}
