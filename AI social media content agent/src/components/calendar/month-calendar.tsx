"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { GeneratedContentRow } from "@/lib/types";
import { PLATFORM_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MonthCalendar({ items }: { items: GeneratedContentRow[] }) {
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const itemsByDay = useMemo(() => {
    const map = new Map<string, GeneratedContentRow[]>();
    for (const item of items) {
      const key = format(new Date(item.created_at), "yyyy-MM-dd");
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return map;
  }, [items]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const selectedItems = selected
    ? (itemsByDay.get(format(selected, "yyyy-MM-dd")) ?? [])
    : [];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{format(month, "MMMM yyyy")}</h2>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={() => setMonth((m) => subMonths(m, 1))}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setMonth((m) => addMonths(m, 1))}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="text-muted-foreground py-1 text-xs font-medium">
                {d}
              </div>
            ))}
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayItems = itemsByDay.get(key) ?? [];
              const inMonth = isSameMonth(day, month);
              const isSelected = selected && isSameDay(day, selected);

              return (
                <button
                  key={key}
                  onClick={() => setSelected(day)}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border text-sm transition-colors",
                    inMonth ? "text-foreground" : "text-muted-foreground/40",
                    isSelected ? "border-primary bg-primary/10" : "border-transparent hover:bg-accent"
                  )}
                >
                  <span>{format(day, "d")}</span>
                  {dayItems.length > 0 && (
                    <span className="bg-primary size-1.5 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3">
          <h3 className="font-medium">
            {selected ? format(selected, "EEEE, MMM d") : "Select a day"}
          </h3>
          {selectedItems.length === 0 && (
            <p className="text-muted-foreground text-sm">
              {selected ? "No posts generated on this day." : "Click a highlighted day to see what you generated."}
            </p>
          )}
          <div className="flex flex-col gap-2">
            {selectedItems.map((item) => (
              <div key={item.id} className="rounded-lg border p-2.5 text-sm">
                <div className="mb-1 flex items-center gap-1.5">
                  <Badge variant="outline" className="text-xs">
                    {PLATFORM_LABELS[item.platform]}
                  </Badge>
                </div>
                <p className="text-muted-foreground line-clamp-2">{item.caption}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
