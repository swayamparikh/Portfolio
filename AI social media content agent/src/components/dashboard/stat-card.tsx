import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <Card className={cn("gap-0 py-5", className)}>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
