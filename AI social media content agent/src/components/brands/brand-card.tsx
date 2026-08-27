import { Users } from "lucide-react";

import type { BrandProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandDialog } from "./brand-dialog";
import { DeleteBrandButton } from "./delete-brand-button";

export function BrandCard({ brand }: { brand: BrandProfile }) {
  return (
    <Card className="gap-3">
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div className="min-w-0">
          <CardTitle className="truncate">{brand.name}</CardTitle>
          {brand.industry && (
            <p className="text-muted-foreground mt-1 truncate text-sm">{brand.industry}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center">
          <BrandDialog brand={brand} />
          <DeleteBrandButton id={brand.id} name={brand.name} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {brand.tone && <Badge variant="secondary">{brand.tone}</Badge>}
        {brand.audience && (
          <p className="text-muted-foreground flex items-start gap-2 text-sm">
            <Users className="mt-0.5 size-4 shrink-0" />
            <span className="line-clamp-2">{brand.audience}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
