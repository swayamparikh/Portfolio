import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  size = "sm",
  className,
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <span className={cn("inline-flex items-center gap-1 text-text-heading", className)}>
      <Star className={cn(iconSize, "fill-text-heading text-text-heading")} />
      <span className="text-sm font-medium">{value.toFixed(1)}</span>
      {count != null && (
        <span className="text-sm text-text-muted">({count})</span>
      )}
    </span>
  );
}
