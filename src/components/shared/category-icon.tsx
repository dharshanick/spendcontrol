import { getCategoryIcon } from "@/lib/data";
import { cn } from "@/lib/utils";

type CategoryIconProps = {
    category: string;
    className?: string;
}

export default function CategoryIcon({ category, className }: CategoryIconProps) {
    const Icon = getCategoryIcon(category);
    return <Icon className={cn("h-5 w-5", className)} />;
}
