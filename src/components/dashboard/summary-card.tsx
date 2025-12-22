
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Edit } from "lucide-react";
import { Button } from "../ui/button";
import { useCurrency } from "@/hooks/use-currency";

type SummaryCardProps = {
  title: string;
  amount: number;
  comparison?: number;
  icon: React.ReactNode;
  onEdit?: () => void;
};

const TrendIcon = ({ comparison }: { comparison?: number }) => {
  if (comparison === undefined || !isFinite(comparison)) return null;

  const isPositive = comparison >= 0;
  
  return (
    <div className={cn("flex items-center text-xs", isPositive ? "text-green-500" : "text-red-500")}>
      {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
      <span>{Math.abs(comparison).toFixed(0)}% vs last period</span>
    </div>
  );
};

export default function SummaryCard({
  title,
  amount,
  comparison,
  icon,
  onEdit,
}: SummaryCardProps) {
  const { currencySymbol } = useCurrency();
  return (
    <Card className="shadow-md shadow-primary/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {onEdit ? (
           <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
                <Edit className="h-4 w-4 text-muted-foreground" />
            </Button>
            {icon}
           </div>
        ) : icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{currencySymbol}{amount.toLocaleString()}</div>
        <TrendIcon comparison={comparison} />
      </CardContent>
    </Card>
  );
}
