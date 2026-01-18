"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/use-currency";
import { usePrivacy } from "@/hooks/use-privacy"; // Import hook

interface SummaryCardProps {
  title: string;
  amount: number;
  comparison: number;
  icon: React.ReactNode;
  onEdit?: () => void;
}

export default function SummaryCard({ title, amount, comparison, icon, onEdit }: SummaryCardProps) {
  const { currencySymbol } = useCurrency();
  const { isPrivacyMode } = usePrivacy(); // Check mode

  const isPositive = comparison >= 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex gap-1">
          {onEdit && (
            <Button variant="ghost" size="icon" className="h-4 w-4 text-muted-foreground" onClick={onEdit}>
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          )}
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {/* PRIVACY LOGIC: Show stars if privacy is on */}
        <div className={`text-2xl font-bold ${isPrivacyMode ? 'blur-[4px] select-none' : ''}`}>
          {isPrivacyMode ? '****' : `${currencySymbol}${amount.toLocaleString()}`}
        </div>

        {!isPrivacyMode && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            {isPositive ? (
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            )}
            <span className={isPositive ? "text-green-500" : "text-red-500"}>
              {Math.abs(comparison).toFixed(1)}%
            </span>
            <span className="ml-1">vs last period</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
