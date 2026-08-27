import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ResultSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Skeleton className="h-48 w-full max-w-md" />
        <Skeleton className="h-24 w-full" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-8 w-56" />
      </CardContent>
    </Card>
  );
}
