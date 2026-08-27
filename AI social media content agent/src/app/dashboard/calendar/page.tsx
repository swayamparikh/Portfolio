import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { generatedContent } from "@/db/schema";
import { toGeneratedContentRow } from "@/db/mappers";
import { auth } from "@/auth";
import { MonthCalendar } from "@/components/calendar/month-calendar";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage() {
  const session = await auth();
  const user = session!.user;

  const rows = await db
    .select()
    .from(generatedContent)
    .where(eq(generatedContent.userId, user.id))
    .orderBy(desc(generatedContent.createdAt));
  const items = rows.map(toGeneratedContentRow);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Content Calendar</h1>
        <p className="text-muted-foreground text-sm">
          Everything you&apos;ve generated, mapped to the day it was created.
        </p>
      </div>
      <MonthCalendar items={items} />
    </div>
  );
}
