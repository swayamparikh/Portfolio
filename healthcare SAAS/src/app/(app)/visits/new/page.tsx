import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { VisitForm } from "@/components/visit-form";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export default async function NewVisitPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>;
}) {
  const user = await requireUser();
  const { patient: preselect } = await searchParams;

  const roster = await db
    .select({
      id: patients.id,
      caseReference: patients.caseReference,
      diagnosisSummary: patients.diagnosisSummary,
      sessionsAuthorized: patients.sessionsAuthorized,
      visitCount: sql<number>`(select count(*) from visits where visits.patient_id = ${patients.id})`,
    })
    .from(patients)
    .where(eq(patients.clinicId, user.clinicId))
    .orderBy(desc(patients.createdAt));

  if (roster.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="glass p-12 text-center">
          <h1 className="text-xl font-semibold">No cases yet</h1>
          <p className="mt-2 text-muted">Add a de-identified case before logging a visit.</p>
          <Link href="/patients/new" className="btn-primary mt-6">Add patient</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Reveal>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Log a visit</h1>
          <p className="mt-1.5 text-muted">
            Structured fields where you have numbers, free text where you don&apos;t. The
            draft note references this patient&apos;s prior visits automatically.
          </p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <VisitForm
          patients={roster.map((p) => ({
            ...p,
            visitCount: Number(p.visitCount),
          }))}
          preselect={preselect}
        />
      </Reveal>
    </div>
  );
}
